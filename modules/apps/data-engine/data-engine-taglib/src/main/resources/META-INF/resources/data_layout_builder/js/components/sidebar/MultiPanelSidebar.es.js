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

import ClayButton, {ClayButtonWithIcon} from '@clayui/button';
import ClayIcon from '@clayui/icon';
import ClayLoadingIndicator from '@clayui/loading-indicator';
import {ClayTooltipProvider} from '@clayui/tooltip';
import classNames from 'classnames';
import {useIsMounted, useStateSafe} from 'frontend-js-react-web';
<<<<<<< HEAD
import React, {useRef, useState} from 'react';

import AppContext from '../../AppContext.es';
import useLoad from '../../hooks/useLoad.es';

const {useContext, useEffect} = React;
=======
import React from 'react';

import AppContext from '../../AppContext.es';
import useLazy from '../../hooks/useLazy.es';
import useLoad from '../../hooks/useLoad.es';
import usePlugins from '../../hooks/usePlugins.es';

const {Suspense, useCallback, useContext, useEffect} = React;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

const CLASSNAME_INDICATORS = [
	'.change-tracking-indicator',
	'.staging-indicator',
];

/**
 * Failure to preload is a non-critical failure, so we'll use this to swallow
 * rejected promises silently.
 */
const swallow = [(value) => value, (_error) => undefined];

export default function MultiPanelSidebar({
	panels,
	sidebarPanels,
	variant = 'dark',
}) {
<<<<<<< HEAD
	const [, dispatch] = useContext(AppContext);
	const [{sidebarOpen, sidebarPanelId}, setSidebarState] = useState({
		sidebarOpen: true,
		sidebarPanelId: 'fields',
	});
	const [hasError, setHasError] = useStateSafe(false);
	const isMounted = useIsMounted();
	const load = useLoad();
	const sidebarPanelsRef = useRef(sidebarPanels);

	const [panelComponents, setPanelComponents] = useState([]);

	useEffect(() => {
		const panelPromises = Object.values(sidebarPanelsRef.current).map(
			(sidebarPanel) =>
				load(sidebarPanel.sidebarPanelId, sidebarPanel.pluginEntryPoint)
					.then((Plugin) => {
						const instance = new Plugin(
							{
								dispatch,
								panel: sidebarPanel,
								sidebarOpen: true,
								sidebarPanelId: sidebarPanel.sidebarPanelId,
							},
							sidebarPanel
						);

						return {
							Component: () => instance.renderSidebar(),
							sidebarPanelId: sidebarPanel.sidebarPanelId,
						};
					})
					.catch((error) => console.error(error))
		);

		setPanelComponents([]);

		Promise.all(panelPromises).then((result) => {
			if (isMounted()) {
				setPanelComponents(result);
			}
		});
	}, [isMounted, dispatch, load]);
=======
	const [{sidebarOpen, sidebarPanelId}, dispatch] = useContext(AppContext);
	const [hasError, setHasError] = useStateSafe(false);
	const isMounted = useIsMounted();
	const load = useLoad();
	const {getInstance, register} = usePlugins();

	const panel = sidebarPanels[sidebarPanelId];
	const promise = panel
		? load(sidebarPanelId, panel.pluginEntryPoint)
		: Promise.resolve();

	const app = {
		dispatch,
		panel,
		sidebarOpen,
		sidebarPanelId,
	};

	let registerPanel;

	if (sidebarPanelId) {
		registerPanel = register(sidebarPanelId, promise, {app, panel});
	}

	const togglePlugin = () => {
		if (hasError) {
			setHasError(false);
		}

		if (registerPanel) {
			registerPanel.then((plugin) => {
				if (
					plugin &&
					typeof plugin.activate === 'function' &&
					isMounted()
				) {
					plugin.activate();
				}
				else if (!plugin) {
					setHasError(true);
				}
			});
		}
	};

	useEffect(
		() => {
			if (panel) {
				togglePlugin(panel);
			}
			else if (sidebarPanelId) {
				dispatch({
					payload: {
						sidebarOpen: false,
						sidebarPanelId: null,
					},
					type: 'SWITCH_SIDEBAR_PANEL',
				});
			}
		},
		/* eslint-disable react-hooks/exhaustive-deps */
		[panel, sidebarOpen, sidebarPanelId]
	);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

	const changeAlertClassName = (styleName) => {
		const formBuilderMessage = document.querySelector(
			'.data-engine-form-builder-messages'
		);
		const className = formBuilderMessage.className;

		formBuilderMessage.className = className.replace(
			formBuilderMessage.className,
			styleName
		);
	};

	useEffect(() => {
		const sideNavigation = Liferay.SideNavigation.instance(
			document.querySelector('.product-menu-toggle')
		);

		if (sideNavigation) {
			const onCloseSidebar = () => {
				if (sidebarOpen) {
					changeAlertClassName('data-engine-form-builder-messages');
				}

<<<<<<< HEAD
				setSidebarState({
					sidebarOpen: false,
					sidebarPanelId: null,
=======
				dispatch({
					payload: {
						sidebarOpen: false,
						sidebarPanelId: null,
					},
					type: 'SWITCH_SIDEBAR_PANEL',
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
				});
			};

			const sideNavigationListener = sideNavigation.on(
				'openStart.lexicon.sidenav',
				onCloseSidebar
			);

			return () => {
				sideNavigationListener.removeListener();
			};
		}
<<<<<<< HEAD
	}, [sidebarOpen]);
=======
	}, []);

	const SidebarPanel = useLazy(
		useCallback(({instance}) => {
			if (typeof instance.renderSidebar === 'function') {
				return instance.renderSidebar();
			}
			else if (typeof instance === 'function') {
				return instance;
			}
			else {
				return null;
			}
		}, [])
	);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

	const handleClick = (panel) => {
		const open =
			panel.sidebarPanelId === sidebarPanelId ? !sidebarOpen : true;
		const productMenuToggle = document.querySelector(
			'.product-menu-toggle'
		);

		if (productMenuToggle && !sidebarOpen) {
			Liferay.SideNavigation.hide(productMenuToggle);
		}

		if (open) {
			changeAlertClassName(
				'data-engine-form-builder-messages data-engine-form-builder-messages--collapsed'
			);
		}
		else {
			changeAlertClassName('data-engine-form-builder-messages');
		}

<<<<<<< HEAD
		setSidebarState({
			sidebarOpen: open,
			sidebarPanelId: panel.sidebarPanelId,
=======
		dispatch({
			payload: {
				sidebarOpen: open,
				sidebarPanelId: panel.sidebarPanelId,
			},
			type: 'SWITCH_SIDEBAR_PANEL',
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		});
	};

	return (
		<ClayTooltipProvider>
			<div
				className={classNames(
					'multi-panel-sidebar',
					`multi-panel-sidebar-${variant}`,
					{
						'menu-indicator-enabled': document.querySelector(
							CLASSNAME_INDICATORS.join(',')
						),
					}
				)}
			>
				<nav
					className={classNames(
						'multi-panel-sidebar-buttons',
						'tbar',
						'tbar-stacked',
						variant === 'dark'
							? `tbar-${variant}-d1`
							: `tbar-${variant}`
					)}
				>
					<ul className="tbar-nav">
						{panels.reduce((elements, group, groupIndex) => {
							const buttons = group.map((panelId) => {
								const panel = sidebarPanels[panelId];

								const active =
									sidebarOpen && sidebarPanelId === panelId;
								const {
									icon,
									isLink,
									label,
									pluginEntryPoint,
									url,
								} = panel;

								const prefetch = () =>
									load(
										panel.sidebarPanelId,
										pluginEntryPoint
									).then(...swallow);

								const btnClasses = classNames(
									'tbar-btn tbar-btn-monospaced',
									{active}
								);

								return (
									<li
										className={classNames(
											'tbar-item',
											`tbar-item--${panel.sidebarPanelId}`
										)}
										key={panel.sidebarPanelId}
									>
										{isLink ? (
											<a
												className={btnClasses}
												href={url}
											>
												<ClayIcon symbol={icon} />
											</a>
										) : (
											<ClayButtonWithIcon
												aria-pressed={active}
												className={btnClasses}
												data-tooltip-align="left"
												displayType="unstyled"
												id={panel.sidebarPanelId}
												onClick={() =>
													handleClick(panel)
												}
												onFocus={prefetch}
												onMouseEnter={prefetch}
												symbol={icon}
												title={label}
											/>
										)}
									</li>
								);
							});

							if (groupIndex === panels.length - 1) {
								return elements.concat(buttons);
							}
							else {
								return elements.concat([
									...buttons,
									<hr key={`separator-${groupIndex}`} />,
								]);
							}
						}, [])}
					</ul>
				</nav>
				<div
					className={classNames('multi-panel-sidebar-content', {
						'multi-panel-sidebar-content-open': sidebarOpen,
					})}
				>
					{hasError ? (
						<div>
							<ClayButton
								block
								displayType="secondary"
								onClick={() => {
<<<<<<< HEAD
									setSidebarState({
										sidebarOpen: false,
										sidebarPanelId:
											panels[0] && panels[0][0],
=======
									dispatch({
										payload: {
											sidebarOpen: false,
											sidebarPanelId:
												panels[0] && panels[0][0],
										},
										type: 'SWITCH_SIDEBAR_PANEL',
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
									});
									setHasError(false);
								}}
								small
							>
								{Liferay.Language.get('refresh')}
							</ClayButton>
						</div>
					) : (
						<ErrorBoundary
							handleError={() => {
								setHasError(true);
							}}
						>
<<<<<<< HEAD
							{panelComponents.length === 0 && (
								<ClayLoadingIndicator />
							)}

							{panelComponents.map((panel) => (
								<div
									className={classNames({
										'd-none':
											panel.sidebarPanelId !==
											sidebarPanelId,
									})}
									key={panel.sidebarPanelId}
								>
									<panel.Component />
								</div>
							))}
=======
							<Suspense fallback={<ClayLoadingIndicator />}>
								<SidebarPanel
									getInstance={getInstance}
									pluginId={sidebarPanelId}
								/>
							</Suspense>
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
						</ErrorBoundary>
					)}
				</div>
			</div>
		</ClayTooltipProvider>
	);
}

class ErrorBoundary extends React.Component {
	static getDerivedStateFromError(_error) {
		return {hasError: true};
	}

	constructor(props) {
		super(props);

		this.state = {hasError: false};
	}

	componentDidCatch(error) {
		if (this.props.handleError) {
			this.props.handleError(error);
		}
	}

	render() {
		if (this.state.hasError) {
			return null;
		}
		else {
			return this.props.children;
		}
	}
}
