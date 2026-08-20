/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {useState} from 'react';
import {useSWRConfig} from 'swr';

import {queueTriageRun, triageRunsKey} from '~/hooks/useTriageRuns';
import useTriageSelection from '~/hooks/useTriageSelection';
import i18n from '~/i18n';
import {Liferay} from '~/services/liferay';

type Props = {
	baselineBuildId?: number;
	isBaseline: boolean;
	/** A run for this build is already QUEUED, so there is nothing to request. */
	queued: boolean;
	/** This is the target AND a baseline is chosen — the pair is complete. */
	ready: boolean;
	routineId: number;
	targetBuildId: number;
};

/**
 * The Triage column while a baseline/target pair is being chosen.
 *
 * Three states, and the distinction matters: a chosen baseline is a *label*
 * (nothing to do on it), a chosen target with no baseline yet is also a label
 * (the pair is incomplete), and only a complete pair gets the button. Offering
 * "Run Triage" on a half-made selection would queue a run against an undefined
 * baseline.
 */
const TriageSelectionCell: React.FC<Props> = ({
	baselineBuildId,
	isBaseline,
	queued,
	ready,
	routineId,
	targetBuildId,
}) => {
	const {clear} = useTriageSelection();
	const {mutate} = useSWRConfig();
	const [busy, setBusy] = useState(false);

	if (isBaseline) {
		return (
			<span
				className="tr-triage-chip"
				title={i18n.translate('triage-baseline-selected')}
			>
				{i18n.translate('baseline')}
			</span>
		);
	}

	if (!ready) {
		return (
			<span
				className="tr-triage-chip"
				title={i18n.translate('triage-target-selected')}
			>
				{i18n.translate('target')}
			</span>
		);
	}

	if (queued) {
		return (
			<span className="tr-triage-chip tr-triage-chip--queued">
				{i18n.translate('queued')}
			</span>
		);
	}

	return (
		<ClayButton
			disabled={busy}
			displayType="primary"
			onClick={async () => {
				setBusy(true);

				try {
					await queueTriageRun({
						baselineBuildId: baselineBuildId!,
						routineId,
						targetBuildId,
					});

					// Revalidate before clearing, so the column has the new
					// QUEUED run to fall back to. Without this the cell goes
					// blank instead of amber — and because Testray persists its
					// SWR cache across reloads, it stays blank even after F5,
					// which reads as "the click did nothing".
					await mutate(triageRunsKey(routineId));

					// Clearing on success is what makes the column settle back
					// to the run indicator; leaving the pair selected would
					// keep offering a button for work already requested.
					clear();

					Liferay.Util.openToast({
						message: i18n.translate('triage-run-queued'),
					});
				}
				catch (error) {
					// A silent failure here is the worst outcome: the user
					// walks away believing a run was requested.
					Liferay.Util.openToast({
						message: (error as Error).message,
						type: 'danger',
					});
				}
				finally {
					setBusy(false);
				}
			}}
			small
		>
			{i18n.translate('run-triage')}
		</ClayButton>
	);
};

export default TriageSelectionCell;
