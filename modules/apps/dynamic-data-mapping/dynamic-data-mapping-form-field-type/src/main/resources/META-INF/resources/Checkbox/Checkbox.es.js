/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

import {ClayCheckbox} from '@clayui/form';
import ClayIcon from '@clayui/icon';
import React, {useState} from 'react';

import {FieldBase} from '../FieldBase/ReactFieldBase.es';

const Switcher = ({
	checked: initialChecked,
	disabled,
	label,
	name,
	onChange,
	required,
	showLabel,
<<<<<<< HEAD
	showMaximumRepetitionsInfo,
	spritemap,
	systemSettingsURL,
=======
	spritemap,
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
}) => {
	const [checked, setChecked] = useState(initialChecked);

	return (
<<<<<<< HEAD
		<>
			<label className="ddm-toggle-switch toggle-switch">
				<input
					checked={checked}
					className="toggle-switch-check"
					disabled={disabled}
					name={name}
					onChange={(event) => {
						setChecked(event.target.checked);
						onChange(event, event.target.checked);
					}}
					type="checkbox"
					value={true}
				/>

				<span aria-hidden="true" className="toggle-switch-bar">
					<span className="toggle-switch-handle"></span>

					{(showLabel || required) && (
						<span className="toggle-switch-text toggle-switch-text-right">
							{showLabel && label}

							{required && (
								<ClayIcon
									className="reference-mark"
									spritemap={spritemap}
									symbol="asterisk"
								/>
							)}
						</span>
					)}
				</span>
			</label>
			{checked && showMaximumRepetitionsInfo && (
				<div className="ddm-info">
					<span className="ddm-tooltip">
						<ClayIcon symbol="info-circle" />
					</span>
					<div
						className="ddm-info-text"
						dangerouslySetInnerHTML={{
							__html: Liferay.Util.sub(
								Liferay.Language.get(
									'for-security-reasons-upload-field-repeatibilty-is-limited-the-limit-is-defined-in-x-system-settings-x'
								),
								`<a href=${systemSettingsURL} target="_blank">`,
								'</a>'
							),
						}}
					/>
				</div>
			)}
		</>
=======
		<label className="ddm-toggle-switch toggle-switch">
			<input
				checked={checked}
				className="toggle-switch-check"
				disabled={disabled}
				name={name}
				onChange={(event) => {
					setChecked(event.target.checked);
					onChange(event, event.target.checked);
				}}
				type="checkbox"
				value={true}
			/>

			<span aria-hidden="true" className="toggle-switch-bar">
				<span className="toggle-switch-handle"></span>

				{(showLabel || required) && (
					<span className="toggle-switch-text toggle-switch-text-right">
						{showLabel && label}

						{required && (
							<ClayIcon
								className="reference-mark"
								spritemap={spritemap}
								symbol="asterisk"
							/>
						)}
					</span>
				)}
			</span>
		</label>
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	);
};

const Checkbox = ({
	checked: initialChecked,
	disabled,
	label,
	name,
	onChange,
	required,
	showLabel,
	spritemap,
}) => {
	const [checked, setChecked] = useState(initialChecked);

	return (
		<ClayCheckbox
			checked={checked}
			disabled={disabled}
			label={showLabel && label}
			name={name}
			onChange={(event) => {
				setChecked(event.target.checked);
				onChange(event, event.target.checked);
			}}
		>
			{showLabel && required && (
				<ClayIcon
					className="reference-mark"
					spritemap={spritemap}
					symbol="asterisk"
				/>
			)}
		</ClayCheckbox>
	);
};

const Main = ({
	disabled,
	label,
	name,
	onChange,
	predefinedValue = true,
	required,
	showAsSwitcher = true,
	showLabel = true,
<<<<<<< HEAD
	showMaximumRepetitionsInfo = false,
	spritemap,
	systemSettingsURL,
=======
	spritemap,
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	value,
	...otherProps
}) => {
	const Toggle = showAsSwitcher ? Switcher : Checkbox;

	return (
		<FieldBase
			label={label}
			name={name}
			required={required}
			showLabel={false}
			spritemap={spritemap}
			{...otherProps}
		>
			<Toggle
				checked={value !== undefined ? value : predefinedValue}
				disabled={disabled}
				label={label}
				name={name}
				onChange={onChange}
				required={required}
				showLabel={showLabel}
<<<<<<< HEAD
				showMaximumRepetitionsInfo={showMaximumRepetitionsInfo}
				spritemap={spritemap}
				systemSettingsURL={systemSettingsURL}
=======
				spritemap={spritemap}
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			/>
		</FieldBase>
	);
};

Main.displayName = 'Checkbox';

export {Main};
export default Main;
