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

import {ClaySelect} from '@clayui/form';
import ClayIcon, {ClayIconSpriteContext} from '@clayui/icon';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useState} from 'react';

import Datalist from '../datalist/Datalist';
import {generateOptions, getInputStyle} from './utils/index';

function QuantitySelector(props) {
	const [selectedQuantity, setSelectedQuantity] = useState(props.quantity);

	const quantitiesList = generateOptions(props.settings);

	const updateQuantity = useCallback(
		(q) => {
			if (q !== null) {
				setSelectedQuantity(q);
				try {
					props.updateQuantity(q);
				}
				catch (event) {
					// eslint-disable-next-line no-console
					console.log('stand alone component');
				}
			}
		},
		[props]
	);

	const inputStyle = getInputStyle(props.inputSize);

	useEffect(() => {
		if (props.quantity) {
			updateQuantity(props.quantity);
		}
		else {
			updateQuantity(selectedQuantity);
		}
	}, [selectedQuantity, props.quantity, updateQuantity]);

	const content = (
		<div
			className="input-group input-group-sm quantity-selector simple"
			data-testid="quantity-selector"
			style={inputStyle}
		>
			{(props.prependedIcon || props.prependedText) && (
				<div className="input-group-item input-group-item-shrink input-group-prepend">
					<span className="input-group-text">
						{props.prependedIcon ? (
							<ClayIcon
								spritemap={props.spritemap}
								symbol={props.prependedIcon}
							/>
						) : (
							props.prependedText
						)}
					</span>
				</div>
			)}
			<div
				className={classnames(
					'input-group-item input-group-item-shrink',
					(props.appendedIcon || props.appendedText) &&
						'input-group-prepend'
				)}
			>
				{props.style === 'datalist' && (
					<Datalist
						className="quantity-selector-input"
						disabled={props.disabled}
						id="quantitySelect"
						size={props.size}
						updateQuantity={updateQuantity}
					>
						{quantitiesList.map((item) => (
							<option key={item} label={item} value={item} />
						))}
					</Datalist>
				)}

				{props.style === 'select' && (
					<ClaySelect
						aria-label="Select Label"
						classnames={classnames(
							'quantity-selector-input',
							props.size === 'small' && 'form-control-sm',
							props.size === 'large' && 'form-control-lg'
						)}
						data-testid="select"
						disabled={props.disabled}
						id="quantitySelect"
						onChange={(event) => {
							updateQuantity(event.target.value);
						}}
					>
						{quantitiesList.map((item) => (
							<ClaySelect.Option
								key={item}
								label={item}
								value={item}
							/>
						))}
					</ClaySelect>
				)}
			</div>

			{(props.appendedIcon || props.appendedText) && (
				<div className="input-group-append input-group-item input-group-item-shrink">
					<span className="input-group-text">
						{props.appendedIcon ? (
							<ClayIcon
								spritemap={props.spritemap}
								symbol={props.appendedIcon}
							/>
						) : (
							props.appendedText
						)}
					</span>
				</div>
			)}
		</div>
	);

	return props.spritemap ? (
		<ClayIconSpriteContext.Provider value={props.spritemap}>
			{content}
		</ClayIconSpriteContext.Provider>
	) : (
		content
	);
}

QuantitySelector.defaultProps = {
	disabled: false,
	inputSize: '1555',
	quantity: 1,
	settings: {
		allowedQuantity: [],
		maxQuantity: 99,
		minQuantity: 1,
		multipleQuantity: 1,
	},
	style: 'select',
};

QuantitySelector.propTypes = {
	appendedIcon: PropTypes.string,
	appendedText: PropTypes.string,
	disableAddToCartButton: PropTypes.bool,
	disableQuantitySelector: PropTypes.bool,
	disabled: PropTypes.bool,
	inputName: PropTypes.string,
	inputSize: PropTypes.string,
	prependedIcon: PropTypes.string,
	prependedText: PropTypes.string,
	quantity: PropTypes.number,
	rtl: PropTypes.bool,
	settings: PropTypes.shape({
		allowedQuantity: PropTypes.arrayOf(PropTypes.number),
		maxQuantity: PropTypes.number,
		minQuantity: PropTypes.number,
		multipleQuantity: PropTypes.number,
	}).isRequired,
	size: PropTypes.oneOf(['large', 'medium', 'small']),
	spritemap: PropTypes.string.isRequired,
	style: PropTypes.oneOf(['select', 'datalist']),
	updateQuantity: PropTypes.func,
};

export default QuantitySelector;
