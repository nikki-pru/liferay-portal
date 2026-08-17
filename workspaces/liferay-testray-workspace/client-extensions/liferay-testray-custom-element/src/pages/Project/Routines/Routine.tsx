/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {DisplayType as AlertDisplayType} from '@clayui/alert';
import ClayIcon from '@clayui/icon';
import ClayLabel from '@clayui/label';
import classNames from 'classnames';
import {useOutletContext, useParams} from 'react-router-dom';
import Container from '~/components/Layout/Container';
import ListView from '~/components/ListView';
import ProgressBar from '~/components/ProgressBar';
import i18n from '~/i18n';
import {TestrayBuild, TestrayRoutine} from '~/services/rest';
import {testrayBuildAlertProperties} from '~/util/constants';
import dayjs from '~/util/date';
import {filterStatuses} from '~/util/statuses';

import useTriageRuns, {
	TRIAGE_RUN_DISPLAY,
	triageURL,
} from '~/hooks/useTriageRuns';

import BuildHistoryChart from './Builds/BuildHistoryChart';
import useBuildActions from './Builds/useBuildActions';

type OutletContext = {
	testrayRoutine: TestrayRoutine;
};

const Routine = () => {
	const {actions, formModal} = useBuildActions();
	const {routineId} = useParams();
	const {testrayRoutine}: OutletContext = useOutletContext();

	const teamId = testrayRoutine.r_teamToRoutines_c_teamId

	// Side-fetched rather than read off the row: the build list comes from
	// testray-builds-metrics, hand-written SQL in TestrayStatusMetricResourceImpl,
	// and adding a field there would mean editing Testray core. One request per
	// routine — the routine FK makes it independent of pagination.
	const triageRuns = useTriageRuns(routineId);

	const baseResoruceURL = `/testray-status-metrics/by-testray-routineId/${routineId}/testray-builds-metrics`;

	const filter = teamId
		? `?filter=%7B"testrayTeamIds"%3A%5B${teamId}%5D%7D&filterSchema=buildResults`
		: '';

	return (
		<Container>
			<ListView
				forceRefetch={formModal.forceRefetch}
				initialContext={{
					columns: {
						in_progress: false,
						passed: false,
						total: false,
						untested: false,
					},
				}}
				managementToolbarProps={{
					applyFilters: true,
					filterSchema: 'builds',
					title: i18n.translate('build-history'),
				}}
				resource={teamId ? `${baseResoruceURL}?testrayTeamId=${teamId}` : baseResoruceURL}
				tableProps={{
					actions,
					columns: [
						{
							key: 'status',
							render: (
								_,
								{
									testrayBuildPromoted,
									testrayBuildTaskStatus,
								}: TestrayBuild
							) => (
								<>
									{testrayBuildPromoted && (
										<span
											title={i18n.translate('promoted')}
										>
											<ClayIcon
												className="mr-3"
												color="darkblue"
												symbol="star"
											/>
										</span>
									)}

									{testrayBuildTaskStatus && (
										<span
											title={
												filterStatuses[
													testrayBuildTaskStatus
												]
											}
										>
											<ClayIcon
												className={classNames(
													'label-chart symbol',
													{
														[testrayBuildTaskStatus.toLowerCase()]:
															testrayBuildTaskStatus,
													}
												)}
												symbol="circle"
											/>
										</span>
									)}
								</>
							),
							value: i18n.translate('build-status'),
						},
						{
							key: 'triage',
							render: (_, {id}: TestrayBuild) => {
								const status =
									triageRuns.get(Number(id))
										?.triageRunStatus?.key;

								// Nothing at all when a build has no triage
								// run — the same way an unpromoted build shows
								// no star. This is what keeps the column quiet
								// on routines that never triage, and what makes
								// it inert when the analytics CX is absent.
								if (!status) {
									return null;
								}

								const {clickable, color, label} =
									TRIAGE_RUN_DISPLAY[status];

								const diamond = (
									<span
										className="tr-triage-diamond"
										style={{backgroundColor: color}}
									/>
								);

								return (
									<span title={label}>
										{clickable ? (
											<a href={triageURL(id)}>
												{diamond}
											</a>
										) : (
											diamond
										)}
									</span>
								);
							},
							size: 'sm',
							value: i18n.translate('triage'),
						},
						{
							clickable: true,
							key: 'testrayBuildDueDate',
							render: (testrayBuildDueDate) =>
								dayjs(testrayBuildDueDate).format('lll'),
							size: 'sm',
							value: i18n.translate('execution-date'),
						},
						{
							clickable: true,
							key: 'testrayBuildCPUUseTime',
							render: (testrayBuildCPUUseTime) =>
								testrayBuildCPUUseTime === 'null' || ''
									? '-'
									: testrayBuildCPUUseTime,
							value: i18n.translate('cpu-use-time'),
						},
						{
							clickable: true,
							key: 'testrayBuildGitHash',
							render: (testrayBuildGitHash) =>
								testrayBuildGitHash === 'null' || ''
									? '-'
									: testrayBuildGitHash,
							value: i18n.translate('git-hash'),
						},
						{
							clickable: true,
							key: 'testrayBuildProductVersion',
							value: i18n.translate('product-version'),
						},
						{
							key: 'testrayBuildName',
							selectable: true,
							value: i18n.translate('build'),
						},
						{
							key: 'testrayBuildImportStatus',
							render: (
								_,
								{testrayBuildImportStatus}: TestrayBuild
							) => (
								<>
									{testrayBuildImportStatus && (
										<>
											<ClayLabel
												displayType={
													testrayBuildAlertProperties[
														testrayBuildImportStatus
													]
														.displayType as AlertDisplayType
												}
											>
												{
													testrayBuildAlertProperties[
														testrayBuildImportStatus
													].label
												}
											</ClayLabel>
										</>
									)}
								</>
							),
							value: i18n.translate('import-status'),
						},
						{
							clickable: true,
							key: 'failed',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.failed,
							value: i18n.translate('failed'),
						},
						{
							clickable: true,
							key: 'blocked',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.blocked,
							value: i18n.translate('blocked'),
						},
						{
							clickable: true,
							key: 'untested',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.untested,
							value: i18n.translate('untested'),
						},
						{
							clickable: true,
							key: 'in-progress',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.inProgress,
							value: i18n.translate('in-progress'),
						},
						{
							clickable: true,
							key: 'passed',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.passed,
							value: i18n.translate('passed'),
						},
						{
							clickable: true,
							key: 'test-fix',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.testfix,
							value: i18n.translate('test-fix'),
						},
						{
							clickable: true,
							key: 'total',
							render: (_, {testrayStatusMetric}) =>
								testrayStatusMetric.total,
							value: i18n.translate('total'),
						},
						{
							clickable: true,
							key: 'testrayStatusMetric',
							render: (testrayStatusMetric) => (
								<ProgressBar
									chartOrder={[
										'passed',
										'failed',
										'blocked',
										'test_fix',
										'incomplete',
									]}
									items={{
										blocked: testrayStatusMetric?.blocked,
										failed: testrayStatusMetric?.failed,
										incomplete:
											testrayStatusMetric?.incomplete +
											testrayStatusMetric?.untested,
										passed: testrayStatusMetric?.passed,
										test_fix: testrayStatusMetric?.testfix,
									}}
								/>
							),
							size: 'xl',
							value: i18n.translate('metrics'),
						},
					],
					navigateTo: ({testrayBuildId, testrayRoutineId}) => {
						if(routineId == testrayRoutineId) {
							return `build/${testrayBuildId}`
						}
						
						return `build/${testrayBuildId}${filter}`
					}
				}}
			>
				{({items, totalCount}) =>
					totalCount > 0 && <BuildHistoryChart builds={items} />
				}
			</ListView>
		</Container>
	);
};

export default Routine;
