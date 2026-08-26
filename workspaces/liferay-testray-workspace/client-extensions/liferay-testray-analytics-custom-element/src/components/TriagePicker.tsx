/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useMemo, useState} from 'react';

import {
	queueTriageRun,
	useComparability,
	usePickerBuilds,
	usePickerProjects,
	usePickerRoutines,
} from '~/services/triage';
import type {IndexRow} from '~/types';

type Props = {
	/** Revalidate the index so a freshly queued run appears in the list. */
	onQueued: () => void;
	/** Existing runs, so an already-triaged pair links out instead of re-running. */
	runs: IndexRow[];
};

/**
 * Pick a baseline and a target to triage.
 *
 * Mirrors Testray's compare-runs affordance (select A, select B, act) so it
 * needs no new interaction vocabulary — see ARCHITECTURE "Triggering a run".
 *
 * Run Triage queues the pair and stops there. It writes the same QUEUED
 * `TriageRun` as Testray's build-list menu, against the same derived ERC, so
 * the two entry points are one request as far as `runner.py` is concerned.
 *
 * This used to print a `testray-analysis prepare` command instead, because
 * nothing drained the queue. The runner now exists, and the command was never
 * usable by the people who read this page — it assumes a portal checkout, a
 * configured CLI and credentials. Queueing is the only affordance a Testray
 * user actually has.
 *
 * What it still cannot promise is that the run STARTS: a runner has to be
 * watching (`testray-analysis watch --classify`), and if none is, the row sits
 * QUEUED. So the copy says the run was requested, never that it is running.
 */
const TriagePicker: React.FC<Props> = ({onQueued, runs}) => {
	const projects = usePickerProjects();

	const [queueing, setQueueing] = useState(false);
	const [queueError, setQueueError] = useState('');

	const [projectId, setProjectId] = useState<number>();
	const [routineId, setRoutineId] = useState<number>();
	const [baseline, setBaseline] = useState<number>();
	const [target, setTarget] = useState<number>();

	const routines = usePickerRoutines(projectId);
	const {builds, isLoading: buildsLoading} = usePickerBuilds(routineId);
	const {comparability, isLoading: checking} = useComparability(
		baseline,
		target
	);

	// A pair is only meaningful across two different builds; comparing a build
	// with itself yields an empty diff and a report with nothing in it.
	const ready = Boolean(baseline && target && baseline !== target);

	const existing = useMemo(
		() =>
			ready
				? runs.find(
						(run) =>
							run.buildId === target &&
							run.baselineBuildId === baseline
					)
				: undefined,
		[ready, runs, baseline, target]
	);

	const buildOptions = (exclude?: number) =>
		builds
			.filter((build) => build.id !== exclude)
			.map((build) => (
				<option key={build.id} value={build.id}>
					{build.name || build.id}
					{build.promoted ? ' (promoted)' : ''}
				</option>
			));

	return (
		<div className="picker">
			<h2>Start a triage</h2>

			<div className="filters-row">
				<label htmlFor="pick-project">Project:</label>

				<select
					id="pick-project"
					onChange={(event) => {
						setProjectId(Number(event.target.value) || undefined);
						// Everything downstream belonged to the old project.
						setRoutineId(undefined);
						setBaseline(undefined);
						setTarget(undefined);
					}}
					value={projectId ?? ''}
				>
					<option value="">Select…</option>

					{projects.map((project) => (
						<option key={project.id} value={project.id}>
							{project.name}
						</option>
					))}
				</select>

				<label htmlFor="pick-routine">Routine:</label>

				<select
					disabled={!projectId}
					id="pick-routine"
					onChange={(event) => {
						setRoutineId(Number(event.target.value) || undefined);
						setBaseline(undefined);
						setTarget(undefined);
					}}
					value={routineId ?? ''}
				>
					<option value="">Select…</option>

					{routines.map((routine) => (
						<option key={routine.id} value={routine.id}>
							{routine.name}
						</option>
					))}
				</select>
			</div>

			<div className="filters-row">
				<label htmlFor="pick-baseline">Baseline:</label>

				<select
					disabled={!routineId || buildsLoading}
					id="pick-baseline"
					onChange={(event) =>
						setBaseline(Number(event.target.value) || undefined)
					}
					value={baseline ?? ''}
				>
					<option value="">
						{buildsLoading ? 'Loading…' : 'Select…'}
					</option>

					{buildOptions(target)}
				</select>

				<label htmlFor="pick-target">Target:</label>

				<select
					disabled={!routineId || buildsLoading}
					id="pick-target"
					onChange={(event) =>
						setTarget(Number(event.target.value) || undefined)
					}
					value={target ?? ''}
				>
					<option value="">
						{buildsLoading ? 'Loading…' : 'Select…'}
					</option>

					{buildOptions(baseline)}
				</select>
			</div>

			{routineId && !buildsLoading && builds.length < 2 && (
				<p className="picker-note">
					This routine has {builds.length === 1 ? 'only one build' : 'no builds'} mirrored,
					so there is no pair to compare.
				</p>
			)}

			{/* Before the pipeline, not after: an incomparable pair still
			    produces a report, just one describing a handful of tests. */}
			{ready && checking && (
				<p className="picker-note">Checking whether these builds ran the same tests…</p>
			)}

			{ready && comparability && !comparability.comparable && (
				<p className="picker-note picker-warn">
					<strong>
						These builds share only{' '}
						{comparability.share < 0.1
							? (comparability.share * 100).toFixed(1)
							: Math.round(comparability.share * 100)}
						% of their tests
					</strong>{' '}
					({comparability.matched} of {comparability.sampled} sampled).
					The diff joins on case id, so a triage of this pair covers
					only that overlap — usually it means the suite was
					re-selected between them. Pick two builds from the same
					generation: consecutive builds of one routine normally share
					their whole case set, and a build and its retest always do.
				</p>
			)}

			{/* Four outcomes, because "a run exists" is not one state: a
			    finished run is a link, a pending one is a wait, and a failed
			    or withdrawn one is a reason to try again. Collapsing them
			    would either hide a usable report or offer a second run for
			    work already in flight. */}
			{ready &&
				(existing?.status === 'DONE' ? (
					<p className="picker-note">
						This pair has already been triaged.{' '}
						<a href={`?buildId=${existing.buildId}`}>
							Open the report
						</a>
						.
					</p>
				) : existing?.status === 'QUEUED' ||
				  existing?.status === 'RUNNING' ? (
					<p className="picker-note">
						A triage of this pair is already{' '}
						{existing.status === 'QUEUED'
							? 'queued'
							: 'in progress'}
						. It appears in the list below, and the report opens
						from there once it finishes.
					</p>
				) : (
					<>
						<p className="picker-note">
							{existing
								? `The last triage of this pair ${
										existing.status === 'ABORTED'
											? 'was withdrawn'
											: 'failed'
									}. Queueing again replaces it.`
								: 'No triage exists for this pair yet.'}{' '}
							Queueing requests a run; it starts when a runner
							picks it up.
						</p>

						<button
							className="run-triage"
							disabled={queueing || !routineId}
							onClick={async () => {
								setQueueing(true);
								setQueueError('');

								try {
									await queueTriageRun({
										baselineBuildId: baseline!,
										routineId: routineId!,
										targetBuildId: target!,
									});

									// Revalidate before returning: the queued
									// row is what flips this block to the
									// "already queued" branch, so without it
									// the button stays and invites a second
									// click on work already requested.
									onQueued();
								}
								catch (e) {
									// Silence here is the worst outcome — the
									// user walks away believing a run was
									// requested.
									setQueueError(
										(e as Error).message ||
											'Could not queue the run'
									);
								}
								finally {
									setQueueing(false);
								}
							}}
							type="button"
						>
							{queueing ? 'Queueing…' : 'Run Triage'}
						</button>

						{queueError ? (
							<p className="picker-note picker-warn">
								{queueError}
							</p>
						) : null}
					</>
				))}
		</div>
	);
};

export default TriagePicker;
