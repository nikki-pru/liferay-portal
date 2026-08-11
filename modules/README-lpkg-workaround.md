# Unlicensed LPKG Workaround (DSR + CMP)

This branch (`lpkg-workaround-dsr-cmp`) adds a way to build a marketplace
`.lpkg` **locally** for an app, using the already-published jars on Nexus
instead of compiling from source, and prepares the Digital Sales Room (DSR)
and Content Marketing Platform (CMP) apps so they can be built this way.

It exists to produce an installable app bundle **without** the Marketplace
paid-publish step — hence "unlicensed" (see [Why "unlicensed"](#why-unlicensed)).

## What Changed

Three related pieces of work live on this branch:

| Area | Ticket | Summary |
| --- | --- | --- |
| Build machinery | `LPD-96055` | New ant targets that assemble an lpkg from Nexus-published jars, plus an anonymous-download fallback |
| DSR prep | `LPD-98826` | Makes `modules/dxp/apps/digital-sales-room` buildable/releasable as an lpkg |
| CMP prep | `LPD-98960` | Same treatment for `modules/dxp/apps/content-marketing-platform` |

### Build Machinery (`LPD-96055`)

Added to `modules/build-app.xml` and `modules/build-app-module.xml`. The
targets form a pipeline, each depending on the previous:

1. **`download-artifact-lpkg`** (`build-app-module.xml`) — for one module,
   downloads its published jar from Nexus into the destination the module's
   `bnd.bnd` dictates: the `- API/`, `- Impl/`, or `- SPI/` grouping folder.
   Depends on `get-artifact-properties` (which reads `bnd.bnd` to compute that
   destination) and `get-artifact-properties-releng` (which supplies the
   Nexus URL from `.releng/.../artifact.properties`).

1. **`dist-module-artifacts-unlicensed-lpkg`** (`build-app.xml`) — creates
   `${dist.dir}/lpkg`, resolves the suite title prefix, and fans out over
   `${app.module.dirs}` via `subant`, calling `download-artifact-lpkg` for
   each module. Result: all jars staged into their grouping folders.

1. **`write-unlicensed-lpkg-marketplace-properties`** (`build-app.xml`) —
   writes the `liferay-marketplace.properties` file for each grouping folder
   (bundles list, category, description, title, version, etc.), sourced from
   the app's `app.bnd` `Liferay-Releng-*` values.

1. **`build-app-unlicensed-lpkg`** (`build-app.xml`) — the orchestrator. Zips
   each grouping folder into a nested `<Title> - API.lpkg` / `- Impl.lpkg`,
   then zips those into the outer `<Title> unlicensed.lpkg`, and cleans up
   `${dist.dir}`. Also depends on `get-app-version`,
   `update-app-marketplace-version`, and `write-app-change-log`.

**Anonymous-download fallback** (`build-app-module.xml`, commit
`LPD-96055 Add fallback...`): `download-artifact` and `download-artifact-sources`
previously used authenticated `get` whenever the module was under `dxp/` or an
override was set. They now additionally require `build.repository.private.username`
to be non-empty; when credentials are empty they fall back to an anonymous
`get`, so the build works against public releases without private Nexus creds.

### DSR and CMP Prep (`LPD-98826`, `LPD-98960`)

Neither app was previously set up as a releasable marketplace app. Each prep
commit adds, per app:

- **`app.bnd`** — the `Liferay-Releng-*` metadata (title, category, marketplace
  flags) that drives the lpkg build and the marketplace properties.
- **`build.gradle`** — `apply plugin: "com.liferay.app.defaults.plugin"`, which
  wires the app directory into the app build machinery.
- **Per-module `bnd.bnd` + empty `.lfrbuild-portal`** marker files for each
  module that ships in the app.
- **`.releng/dxp/apps/<app>/.../artifact.properties` + `liferay-releng.changelog`** —
  one dir per published module, recording the Nexus URL / version / git id of
  the last published artifact. These are what `download-artifact-lpkg` reads to
  know which jar to fetch.

## How to Run It

`build-app-unlicensed-lpkg` is a standalone target in `modules/build-app.xml`.
It is **not** wrapped by `build-app-lpkg-all` (which builds the normal,
source-compiled lpkg). Invoke it with the target app directory as the ant
basedir so `app.bnd` and `${app.module.dirs}` resolve, e.g. for DSR:

```bash
export ANT_OPTS="-Xmx2560m"

cd modules/dxp/apps/digital-sales-room
ant -f "$(git rev-parse --show-toplevel)/modules/build-app.xml" build-app-unlicensed-lpkg
```

The output is written to `${dist.dir}`:

```
<Title> unlicensed.lpkg
└── <Title> - API.lpkg
│   ├── <module jars>.jar
│   └── liferay-marketplace.properties
└── <Title> - Impl.lpkg
    ├── <module jars>.jar
    └── liferay-marketplace.properties
```

> The exact invocation wrapper may differ in the release harness; the canonical
> entry point is the `build-app-unlicensed-lpkg` target. Confirm the app's
> `.releng/.../artifact.properties` versions resolve on Nexus before running —
> a missing version 404s the download step.

## Why "unlicensed"

The jars pulled from Nexus are the **raw published bundles**. This build does
**not** inject the per-jar `META-INF/marketplace.properties` file (holding
`product-id`, `product-version-id`, `license-version`) that a paid Marketplace
publish adds. That stamp is applied by the Marketplace backend at publish time,
keyed on Marketplace product data (`product-id`) that does not exist in source
or on Nexus, and only for `Paid` products. A locally-built lpkg therefore
matches the **unlicensed** form of a marketplace app byte-for-byte on the jars,
and legitimately cannot reproduce the licensed form.
