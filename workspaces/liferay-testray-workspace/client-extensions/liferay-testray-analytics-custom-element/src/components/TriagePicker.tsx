/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useMemo, useState} from 'react';

import {
	useComparability,
	usePickerBuilds,
	usePickerProjects,
	usePickerRoutines,
} from '~/services/triage';
import type {IndexRow} from '~/types';

type Props = {
	/** Existing runs, so an already-triaged pair links out instead of re-running. */
	runs: IndexRow[];
};

/**
 * Pick a baseline and a target to triage.
 *
 * Mirrors Testray's compare-runs affordance (select A, select B, act) so it
 * needs no new interaction vocabulary — see ARCHITECTURE "Triggering a run".
 *
 * What it deliberately does NOT do is queue the run. `TriageRun` has a QUEUED
 * state and the build-index diamond renders it as "generating", but nothing
 * consumes that queue yet: the Jenkins job is step 6 of the build sequence. A
 * button that wrote a QUEUED row today would leave a permanently amber diamond
 * on the build list and a run that never finishes — worse than no button. So
 * until there is a runner, the picker resolves the pair and hands over the
 * exact command that produces it, which is the step a person is actually
 * blocked on. The button slots in here unchanged when the runner lands.
 */
const TriagePicker: React.FC<Props> = ({runs}) => {
	const projects = usePickerProjects();

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

	const command = ready
		? `testray-analysis prepare --baseline-build-id ${baseline} ` +
			`--target-build-id ${target}`
		: '';

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

			{ready &&
				(existing ? (
					<p className="picker-note">
						This pair has already been triaged.{' '}
						<a href={`?buildId=${existing.buildId}`}>
							Open the report
						</a>
						.
					</p>
				) : (
					<>
						<p className="picker-note">
							No triage exists for this pair yet. Run the pipeline
							from a checkout, then <code>classify</code> and{' '}
							<code>submit</code> the bundle it prints:
						</p>

						<pre className="picker-command">{command}</pre>
					</>
				))}
		</div>
	);
};

export default TriagePicker;
