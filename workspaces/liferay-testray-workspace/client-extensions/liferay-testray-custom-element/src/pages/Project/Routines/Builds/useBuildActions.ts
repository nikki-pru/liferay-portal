/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import useAutofillBuild from '~/hooks/useAutofillBuild';
import useTriageSelection from '~/hooks/useTriageSelection';
import usePermission from '~/hooks/usePermission';
import {Liferay} from '~/services/liferay';
import {TestrayRole} from '~/util/constants';

import useFormModal from '../../../../hooks/useFormModal';
import useMutate from '../../../../hooks/useMutate';
import i18n from '../../../../i18n';
import {
	TestrayBuild,
	testrayBuildImpl,
	testrayCaseResultImpl,
} from '../../../../services/rest';
import {Action, ActionsHookParameter} from '../../../../types';

const useBuildActions = ({isHeaderActions}: ActionsHookParameter = {}) => {
	const {removeItemFromList} = useMutate();
	const {setBuildA, setBuildB} = useAutofillBuild();
	const {setBaseline: setTriageBaseline, setTarget: setTriageTarget} =
		useTriageSelection();
	const formModal = useFormModal();
	const hasPermission = usePermission([
		TestrayRole.TESTRAY_ADMINISTRATOR,
		TestrayRole.TESTRAY_LEAD,
	]);
	const navigate = useNavigate();

	const modal = formModal.modal;

	const actionsRef = useRef([
		{
			action: (build) =>
				testrayCaseResultImpl.exportCaseResults(
					build.id ? build.id : Number(build?.testrayBuildId)
				),
			icon: 'download',
			name: i18n.translate('export-csv'),
		},
		{
			action: (build, mutate) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				const buildPromoted = build?.id
					? build?.promoted
					: build?.testrayBuildPromoted;

				testrayBuildImpl
					.update(buildId, {
						promoted: !buildPromoted,
					})
					.then(() => mutate())
					.then(modal.onSuccess)
					.catch(modal.onError);
			},
			icon: 'star',
			name: (build) => {
				const buildPromoted = build?.id
					? build?.promoted
					: build?.testrayBuildPromoted;

				return i18n.translate(buildPromoted ? 'demote' : 'promote');
			},
			permission: hasPermission,
		},
		{
			action: (build, mutate) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				const buildPromoted = build?.id
					? build?.promoted
					: build?.testrayBuildPromoted;

				const buildArchived = build?.id
					? build?.archived
					: build?.testrayBuildArchived;

				if (!buildPromoted) {
					testrayBuildImpl
						.updateArchivedFlag(buildId, !buildArchived)
						.then(() => mutate())
						.catch(modal.onError);
				}
			},
			disabled: (build) => {
				const isPromoted = build?.id
					? build?.promoted
					: build?.testrayBuildPromoted;

				const hasTasks = build?.id
					? !!build?.tasks.length
					: !!build?.testrayBuildTaskStatus;

				return isPromoted || hasTasks;
			},
			icon: 'archive',
			name: (build) => {
				const buildArchived = build?.id
					? build?.archived
					: build?.testrayBuildArchived;

				return i18n.translate(buildArchived ? 'unarchive' : 'archive');
			},
			permission: hasPermission,
		},
		{
			action: (build, mutate) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				return testrayBuildImpl
					.removeResource(buildId)
					?.then(() => removeItemFromList(mutate, buildId))
					.then(modal.onSave)
					.then(() => {
						if (isHeaderActions) {
							navigate('../');
						}
					})
					.catch(modal.onError);
			},
			icon: 'trash',
			name: i18n.translate(isHeaderActions ? 'delete-build' : 'delete'),
			permission: hasPermission,
		},
		{
			action: (build) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				setBuildA(buildId);

				return Liferay.Util.openToast({
					message: i18n.translate('build-a-successfully-added'),
				});
			},
			icon: 'select-from-list',
			name: i18n.translate('select-build-a'),
		},
		{
			action: (build) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				setBuildB(buildId);

				return Liferay.Util.openToast({
					message: i18n.translate('build-b-successfully-added'),
				});
			},
			icon: 'select-from-list',
			name: i18n.translate('select-build-b'),
		},

		// Triage's baseline/target pair, deliberately using the same menu and
		// the same toast as Build A/B above: it is the same kind of decision,
		// so it should not need a second interaction to learn. Neither entry
		// contains triage logic — each records one id and the Triage column
		// decides what to offer once both are set.
		{
			action: (build) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				setTriageBaseline(buildId);

				return Liferay.Util.openToast({
					message: i18n.translate('triage-baseline-selected'),
				});
			},
			icon: 'select-from-list',
			name: i18n.translate('select-triage-baseline'),
		},
		{
			action: (build) => {
				const buildId = build?.id
					? build?.id
					: (build?.testrayBuildId as number);

				setTriageTarget(buildId);

				return Liferay.Util.openToast({
					message: i18n.translate('triage-target-selected'),
				});
			},
			icon: 'select-from-list',
			name: i18n.translate('select-triage-target'),
		},
	] as Action<TestrayBuild>[]);

	return {
		actions: actionsRef.current,
		formModal,
	};
};

export default useBuildActions;
