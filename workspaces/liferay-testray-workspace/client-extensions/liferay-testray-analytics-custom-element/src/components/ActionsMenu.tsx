/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useEffect, useRef, useState} from 'react';

/**
 * The row/cluster actions menu — the last column of the triage table.
 *
 * This column used to be a bare "Create ticket" link headed `Jira`, which
 * named the destination rather than the job. Filing a ticket is one of three
 * things a reader does once they have read a verdict; the other two are
 * correcting it and asking for the test to be fixed. So the column is
 * `Actions` and the link became a menu.
 *
 * Items are ordered ALPHABETICALLY, not by importance. Any importance order
 * here would be a guess — whether you file, correct or fix first depends on
 * the verdict — and an alphabetical list is at least predictable to find
 * things in.
 *
 * Only Create Jira Ticket is wired. The other two are rendered disabled rather
 * than hidden, deliberately: the point of landing them early is to see the
 * shape of the menu and to advertise what is coming. Each carries a tooltip
 * saying what it will do, so a disabled item is self-explanatory instead of
 * looking broken.
 *
 * A kebab rather than a labelled button: this is a per-row control in a table
 * already 11 columns wide, and it matches the affordance Testray's own list
 * views use for row actions. The glyph is inline SVG because the analytics CX
 * has no Clay spritemap wired up, and adding one for three dots is not worth a
 * provider.
 */

export type Action = {

	/** Text to put on the clipboard. Mutually exclusive with `href`. */
	copy?: string;

	/** Absent on a pending action; present ones open in a new tab. */
	href?: string;

	label: string;

	/**
	 * Why the action cannot be used yet. Present means disabled — there is no
	 * separate flag, so an action cannot be disabled without saying why.
	 */
	pending?: string;

	title: string;
};

/**
 * Put `text` on the clipboard, reporting honestly whether it worked.
 *
 * navigator.clipboard is rejected outright in some embedded contexts, so the
 * throwaway-textarea route is a real fallback rather than decoration. What it
 * must never do is claim success it did not achieve: an earlier version
 * selected a hidden element and told the reader to press Ctrl-C, which copied
 * nothing because a display:none element has no selectable content.
 */
async function writeClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);

		return true;
	}
	catch {
		const ta = document.createElement('textarea');

		ta.value = text;
		ta.setAttribute('readonly', '');
		ta.style.opacity = '0';
		ta.style.position = 'fixed';
		ta.style.top = '0';
		document.body.appendChild(ta);
		ta.select();

		let ok = false;

		try {
			ok = document.execCommand('copy');
		}
		catch {
			ok = false;
		}

		document.body.removeChild(ta);

		return ok;
	}
}

const ActionsMenu: React.FC<{actions: Action[]; label?: string}> = ({
	actions,
	label = 'Actions',
}) => {
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) {
			return;
		}

		// Pointer-down rather than click: a click listener would fire on the
		// same event that opened the menu if this ever moves inside a label,
		// and closing on the press feels immediate.

		const onPointerDown = (event: MouseEvent) => {
			if (!wrapRef.current?.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false);
			}
		};

		document.addEventListener('mousedown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);

		return () => {
			document.removeEventListener('mousedown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	return (

		// Every handler stops propagation: the row underneath expands on
		// click, and opening a menu must not also toggle the detail panel.

		<div
			className="actions-menu"
			onClick={(event) => event.stopPropagation()}
			ref={wrapRef}
		>
			<button
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label={label}
				className={`actions-kebab${open ? ' is-open' : ''}`}
				onClick={() => setOpen((was) => !was)}
				title={label}
				type="button"
			>
				<svg aria-hidden="true" height="14" viewBox="0 0 4 16" width="4">
					<circle cx="2" cy="2" r="1.6" />

					<circle cx="2" cy="8" r="1.6" />

					<circle cx="2" cy="14" r="1.6" />
				</svg>
			</button>

			{open && (
				<div className="actions-list" role="menu">
					{actions.map((action) =>
						action.pending ? (
							<span
								aria-disabled="true"
								className="actions-item is-pending"
								key={action.label}
								role="menuitem"
								title={`${action.title} (${action.pending})`}
							>
								{action.label}

								<span className="actions-soon">Soon</span>
							</span>
						) : action.copy ? (
							<button
								className="actions-copy actions-item"
								key={action.label}
								onClick={async (event) => {
									event.preventDefault();
									const el = event.currentTarget;
									const was = el.textContent;
									const ok = await writeClipboard(
										action.copy as string
									);

									el.textContent = ok
										? 'Copied'
										: 'Copy failed';
									setTimeout(() => {
										el.textContent = was;
										setOpen(false);
									}, 1400);
								}}
								role="menuitem"
								title={action.title}
								type="button"
							>
								{action.label}
							</button>
						) : (
							<a
								className="actions-item"
								href={action.href}
								key={action.label}
								onClick={() => setOpen(false)}
								rel="noopener"
								role="menuitem"
								target="_blank"
								title={action.title}
							>
								{action.label}
							</a>
						)
					)}
				</div>
			)}
		</div>
	);
};

export default ActionsMenu;
