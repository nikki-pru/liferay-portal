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

package com.liferay.portal.upgrade.internal.release.osgi.commands;

<<<<<<< HEAD
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.dao.jdbc.DataAccess;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.upgrade.UpgradeProcess;
import com.liferay.portal.kernel.upgrade.UpgradeStep;
import com.liferay.portal.kernel.upgrade.util.UpgradeProcessUtil;
import com.liferay.portal.kernel.version.Version;
import com.liferay.portal.upgrade.PortalUpgradeProcess;
=======
import com.liferay.osgi.service.tracker.collections.map.PropertyServiceReferenceComparator;
import com.liferay.osgi.service.tracker.collections.map.PropertyServiceReferenceMapper;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMap;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMapFactory;
import com.liferay.osgi.service.tracker.collections.map.ServiceTrackerMapListener;
import com.liferay.petra.string.StringBundler;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.kernel.configuration.Configuration;
import com.liferay.portal.kernel.configuration.ConfigurationFactoryUtil;
import com.liferay.portal.kernel.dao.db.DB;
import com.liferay.portal.kernel.dao.db.DBManagerUtil;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.model.Release;
import com.liferay.portal.kernel.service.ReleaseLocalService;
import com.liferay.portal.kernel.upgrade.UpgradeStep;
import com.liferay.portal.kernel.util.GetterUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.output.stream.container.constants.OutputStreamContainerConstants;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.portal.upgrade.internal.executor.SwappedLogExecutor;
import com.liferay.portal.upgrade.internal.executor.UpgradeExecutor;
import com.liferay.portal.upgrade.internal.graph.ReleaseGraphManager;
import com.liferay.portal.upgrade.internal.registry.UpgradeInfo;
<<<<<<< HEAD
import com.liferay.portal.upgrade.internal.release.ReleaseManagerImpl;

import java.sql.Connection;
import java.sql.SQLException;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.SortedMap;

import org.apache.felix.service.command.Descriptor;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;
=======
import com.liferay.portal.upgrade.internal.registry.UpgradeStepRegistratorThreadLocal;
import com.liferay.portal.util.PropsValues;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

import org.apache.felix.service.command.Descriptor;

import org.osgi.framework.BundleContext;
import org.osgi.framework.ServiceReference;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.util.tracker.ServiceTrackerCustomizer;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

/**
 * @author Miguel Pastor
 * @author Carlos Sierra Andrés
 */
@Component(
	immediate = true,
	property = {
<<<<<<< HEAD
		"osgi.command.function=check", "osgi.command.function=checkAll",
		"osgi.command.function=execute", "osgi.command.function=executeAll",
		"osgi.command.function=list", "osgi.command.scope=upgrade"
=======
		"osgi.command.function=check", "osgi.command.function=execute",
		"osgi.command.function=executeAll", "osgi.command.function=list",
		"osgi.command.scope=upgrade"
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	},
	service = ReleaseManagerOSGiCommands.class
)
public class ReleaseManagerOSGiCommands {

<<<<<<< HEAD
	@Descriptor("List pending upgrades")
	public String check() {
		return _check(false);
	}

	@Descriptor("List pending upgrade processes and their upgrade steps")
	public String checkAll() {
		return _check(true);
=======
	@Descriptor("List pending or running upgrades")
	public String check() {
		StringBundler sb = new StringBundler(0);

		Set<String> bundleSymbolicNames = _serviceTrackerMap.keySet();

		for (String bundleSymbolicName : bundleSymbolicNames) {
			String schemaVersionString = getSchemaVersionString(
				bundleSymbolicName);

			ReleaseGraphManager releaseGraphManager = new ReleaseGraphManager(
				_serviceTrackerMap.getService(bundleSymbolicName));

			List<List<UpgradeInfo>> upgradeInfosList =
				releaseGraphManager.getUpgradeInfosList(schemaVersionString);

			int size = upgradeInfosList.size();

			if (size > 1) {
				sb.append("There are ");
				sb.append(size);
				sb.append(" possible end nodes for ");
				sb.append(schemaVersionString);
				sb.append(StringPool.NEW_LINE);
			}

			if (size == 0) {
				continue;
			}

			sb.append("There is an upgrade process available for ");
			sb.append(bundleSymbolicName);
			sb.append(" from ");
			sb.append(schemaVersionString);
			sb.append(" to ");

			List<UpgradeInfo> upgradeInfos = upgradeInfosList.get(0);

			UpgradeInfo lastUpgradeInfo = upgradeInfos.get(
				upgradeInfos.size() - 1);

			sb.append(lastUpgradeInfo.getToSchemaVersionString());

			sb.append(StringPool.NEW_LINE);
		}

		if (sb.index() > 0) {
			sb.setIndex(sb.index() - 1);

			return sb.toString();
		}

		return null;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	@Descriptor("Execute upgrade for a specific module")
	public String execute(String bundleSymbolicName) {
<<<<<<< HEAD
		List<UpgradeInfo> upgradeInfos = _releaseManagerImpl.getUpgradeInfos(
			bundleSymbolicName);

		if (upgradeInfos == null) {
=======
		if (_serviceTrackerMap.getService(bundleSymbolicName) == null) {
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			return "No upgrade processes registered for " + bundleSymbolicName;
		}

		try {
<<<<<<< HEAD
=======
			List<UpgradeInfo> upgradeInfos = _serviceTrackerMap.getService(
				bundleSymbolicName);

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			_upgradeExecutor.execute(bundleSymbolicName, upgradeInfos, null);
		}
		catch (Throwable throwable) {
			_swappedLogExecutor.execute(
				bundleSymbolicName,
				() -> _log.error(
					"Failed upgrade process for module ".concat(
						bundleSymbolicName),
					throwable),
				null);
		}

		return null;
	}

	@Descriptor("Execute upgrade for a specific module and final version")
	public String execute(String bundleSymbolicName, String toVersionString) {
<<<<<<< HEAD
		List<UpgradeInfo> upgradeInfos = _releaseManagerImpl.getUpgradeInfos(
			bundleSymbolicName);

		if (upgradeInfos == null) {
			return "No upgrade processes registered for " + bundleSymbolicName;
		}

		ReleaseGraphManager releaseGraphManager = new ReleaseGraphManager(
			upgradeInfos);
=======
		if (_serviceTrackerMap.getService(bundleSymbolicName) == null) {
			return "No upgrade processes registered for " + bundleSymbolicName;
		}

		String schemaVersionString = getSchemaVersionString(bundleSymbolicName);

		ReleaseGraphManager releaseGraphManager = new ReleaseGraphManager(
			_serviceTrackerMap.getService(bundleSymbolicName));
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		_upgradeExecutor.executeUpgradeInfos(
			bundleSymbolicName,
			releaseGraphManager.getUpgradeInfos(
<<<<<<< HEAD
				_releaseManagerImpl.getSchemaVersionString(bundleSymbolicName),
				toVersionString),
=======
				schemaVersionString, toVersionString),
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			null);

		return null;
	}

	@Descriptor("Execute all pending upgrades")
	public String executeAll() {
		Set<String> upgradeThrewExceptionBundleSymbolicNames = new HashSet<>();

		executeAll(upgradeThrewExceptionBundleSymbolicNames);

		if (upgradeThrewExceptionBundleSymbolicNames.isEmpty()) {
			return "All modules were successfully upgraded";
		}

		StringBundler sb = new StringBundler(
			(upgradeThrewExceptionBundleSymbolicNames.size() * 3) + 3);

		sb.append("The following modules had errors while upgrading:\n");

		for (String upgradeThrewExceptionBundleSymbolicName :
				upgradeThrewExceptionBundleSymbolicNames) {

			sb.append(StringPool.TAB);
			sb.append(upgradeThrewExceptionBundleSymbolicName);
			sb.append(StringPool.NEW_LINE);
		}

		sb.append("Use the command upgrade:list <module name> to get more ");
		sb.append("details about the status of a specific upgrade.");

		return sb.toString();
	}

	@Descriptor("List registered upgrade processes for all modules")
	public String list() {
<<<<<<< HEAD
		Set<String> bundleSymbolicNames =
			_releaseManagerImpl.getBundleSymbolicNames();

		StringBundler sb = new StringBundler(2 * bundleSymbolicNames.size());

		for (String bundleSymbolicName : bundleSymbolicNames) {
=======
		Set<String> keySet = _serviceTrackerMap.keySet();

		StringBundler sb = new StringBundler(2 * keySet.size());

		for (String bundleSymbolicName : keySet) {
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			sb.append(list(bundleSymbolicName));
			sb.append(StringPool.NEW_LINE);
		}

		sb.setIndex(sb.index() - 1);

		return sb.toString();
	}

	@Descriptor("List registered upgrade processes for a specific module")
	public String list(String bundleSymbolicName) {
<<<<<<< HEAD
		List<UpgradeInfo> upgradeInfos = _releaseManagerImpl.getUpgradeInfos(
			bundleSymbolicName);

		StringBundler sb = new StringBundler(5 + (3 * upgradeInfos.size()));
=======
		List<UpgradeInfo> upgradeProcesses = _serviceTrackerMap.getService(
			bundleSymbolicName);

		StringBundler sb = new StringBundler(5 + (3 * upgradeProcesses.size()));
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		sb.append("Registered upgrade processes for ");
		sb.append(bundleSymbolicName);
		sb.append(StringPool.SPACE);
<<<<<<< HEAD
		sb.append(
			_releaseManagerImpl.getSchemaVersionString(bundleSymbolicName));
		sb.append(StringPool.NEW_LINE);

		for (UpgradeInfo upgradeProcess : upgradeInfos) {
=======
		sb.append(getSchemaVersionString(bundleSymbolicName));
		sb.append(StringPool.NEW_LINE);

		for (UpgradeInfo upgradeProcess : upgradeProcesses) {
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			sb.append(StringPool.TAB);
			sb.append(upgradeProcess);
			sb.append(StringPool.NEW_LINE);
		}

		sb.setIndex(sb.index() - 1);

		return sb.toString();
	}

<<<<<<< HEAD
=======
	@Activate
	protected void activate(final BundleContext bundleContext) {
		DB db = DBManagerUtil.getDB();

		_serviceTrackerMap = ServiceTrackerMapFactory.openMultiValueMap(
			bundleContext, UpgradeStep.class,
			StringBundler.concat(
				"(&(upgrade.bundle.symbolic.name=*)(|(upgrade.db.type=any)",
				"(upgrade.db.type=", db.getDBType(), ")))"),
			new PropertyServiceReferenceMapper<String, UpgradeStep>(
				"upgrade.bundle.symbolic.name"),
			new UpgradeServiceTrackerCustomizer(bundleContext),
			Collections.reverseOrder(
				new PropertyServiceReferenceComparator<UpgradeStep>(
					"upgrade.from.schema.version")),
			new UpgradeInfoServiceTrackerMapListener());

		Set<String> upgradedBundleSymbolicNames = new HashSet<>();

		Set<String> bundleSymbolicNames = _serviceTrackerMap.keySet();

		while (upgradedBundleSymbolicNames.addAll(bundleSymbolicNames)) {
			for (String bundleSymbolicName : bundleSymbolicNames) {
				if (!PropsValues.UPGRADE_DATABASE_AUTO_RUN &&
					(_releaseLocalService.fetchRelease(bundleSymbolicName) !=
						null)) {

					continue;
				}

				List<UpgradeInfo> upgradeSteps = _serviceTrackerMap.getService(
					bundleSymbolicName);

				_upgradeExecutor.execute(
					bundleSymbolicName, upgradeSteps,
					OutputStreamContainerConstants.FACTORY_NAME_DUMMY);
			}

			bundleSymbolicNames = _serviceTrackerMap.keySet();
		}

		_activated = true;
	}

	@Deactivate
	protected void deactivate() {
		_serviceTrackerMap.close();
	}

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	protected void executeAll(
		Set<String> upgradeThrewExceptionBundleSymbolicNames) {

		Set<String> upgradableBundleSymbolicNames =
<<<<<<< HEAD
			_releaseManagerImpl.getUpgradableBundleSymbolicNames();
=======
			getUpgradableBundleSymbolicNames();
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

		upgradableBundleSymbolicNames.removeAll(
			upgradeThrewExceptionBundleSymbolicNames);

		if (upgradableBundleSymbolicNames.isEmpty()) {
			return;
		}

		for (String upgradableBundleSymbolicName :
				upgradableBundleSymbolicNames) {

			try {
<<<<<<< HEAD
				List<UpgradeInfo> upgradeInfos =
					_releaseManagerImpl.getUpgradeInfos(
						upgradableBundleSymbolicName);
=======
				List<UpgradeInfo> upgradeInfos = _serviceTrackerMap.getService(
					upgradableBundleSymbolicName);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381

				_upgradeExecutor.execute(
					upgradableBundleSymbolicName, upgradeInfos, null);
			}
			catch (Throwable throwable) {
				_swappedLogExecutor.execute(
					upgradableBundleSymbolicName,
					() -> _log.error(
						"Failed upgrade process for module ".concat(
							upgradableBundleSymbolicName),
						throwable),
					null);

				upgradeThrewExceptionBundleSymbolicNames.add(
					upgradableBundleSymbolicName);
			}
		}

		executeAll(upgradeThrewExceptionBundleSymbolicNames);
	}

<<<<<<< HEAD
	private String _check(boolean showUpgradeSteps) {
		StringBundler sb = new StringBundler(3);

		sb.append(_checkPortal(showUpgradeSteps));

		if (sb.length() > 0) {
			sb.append(StringPool.NEW_LINE);
		}

		sb.append(_checkModules(showUpgradeSteps));

		return sb.toString();
	}

	private String _checkModules(boolean showUpgradeSteps) {
		StringBundler sb = new StringBundler();

		Set<String> bundleSymbolicNames =
			_releaseManagerImpl.getBundleSymbolicNames();

		for (String bundleSymbolicName : bundleSymbolicNames) {
			String schemaVersionString =
				_releaseManagerImpl.getSchemaVersionString(bundleSymbolicName);

			ReleaseGraphManager releaseGraphManager = new ReleaseGraphManager(
				_releaseManagerImpl.getUpgradeInfos(bundleSymbolicName));

			List<List<UpgradeInfo>> upgradeInfosList =
				releaseGraphManager.getUpgradeInfosList(schemaVersionString);

			int size = upgradeInfosList.size();

			if (size > 1) {
				sb.append("There are ");
				sb.append(size);
				sb.append(" possible end nodes for ");
				sb.append(schemaVersionString);
				sb.append(StringPool.NEW_LINE);
			}

			if (size == 0) {
				continue;
			}

			List<UpgradeInfo> upgradeInfos = upgradeInfosList.get(0);

			UpgradeInfo lastUpgradeInfo = upgradeInfos.get(
				upgradeInfos.size() - 1);

			sb.append(
				_getModulePendingUpgradeMessage(
					bundleSymbolicName, schemaVersionString,
					lastUpgradeInfo.getToSchemaVersionString()));

			if (showUpgradeSteps) {
				sb.append(StringPool.COLON);

				for (UpgradeInfo upgradeInfo : upgradeInfos) {
					UpgradeStep upgradeStep = upgradeInfo.getUpgradeStep();

					sb.append(StringPool.NEW_LINE);
					sb.append(StringPool.TAB);
					sb.append(
						_getPendingUpgradeProcessMessage(
							upgradeStep.getClass(),
							upgradeInfo.getFromSchemaVersionString(),
							upgradeInfo.getToSchemaVersionString()));
				}
			}
		}

		return sb.toString();
	}

	private String _checkPortal(boolean showUpgradeSteps) {
		try (Connection connection = DataAccess.getConnection()) {
			Version currentSchemaVersion =
				PortalUpgradeProcess.getCurrentSchemaVersion(connection);

			SortedMap<Version, UpgradeProcess> pendingUpgradeProcesses =
				PortalUpgradeProcess.getPendingUpgradeProcesses(
					currentSchemaVersion);

			if (!pendingUpgradeProcesses.isEmpty()) {
				Version latestSchemaVersion =
					PortalUpgradeProcess.getLatestSchemaVersion();

				StringBundler sb = new StringBundler();

				sb.append(
					_getModulePendingUpgradeMessage(
						"Portal", currentSchemaVersion.toString(),
						latestSchemaVersion.toString()));

				sb.append(" (requires upgrade tool or auto upgrade)");

				if (showUpgradeSteps) {
					sb.append(StringPool.COLON);

					for (SortedMap.Entry<Version, UpgradeProcess> entry :
							pendingUpgradeProcesses.entrySet()) {

						sb.append(StringPool.NEW_LINE);
						sb.append(StringPool.TAB);

						UpgradeProcess upgradeProcess = entry.getValue();
						Version version = entry.getKey();

						sb.append(
							_getPendingUpgradeProcessMessage(
								upgradeProcess.getClass(),
								currentSchemaVersion.toString(),
								version.toString()));

						sb.append(StringPool.NEW_LINE);

						currentSchemaVersion = version;
					}
				}

				return sb.toString();
			}
		}
		catch (SQLException sqlException) {
			if (_log.isWarnEnabled()) {
				_log.warn(
					"Unable to get pending upgrade information for the portal");
			}
		}

		return StringPool.BLANK;
	}

	private String _getModulePendingUpgradeMessage(
		String moduleName, String currentSchemaVersion,
		String finalSchemaVersion) {

		StringBundler sb = new StringBundler(6);

		sb.append("There are upgrade processes available for ");
		sb.append(moduleName);
		sb.append(" from ");
		sb.append(currentSchemaVersion);
		sb.append(" to ");
		sb.append(finalSchemaVersion);

		return sb.toString();
	}

	private String _getPendingUpgradeProcessMessage(
		Class<?> upgradeClass, String fromSchemaVersion,
		String toSchemaVersion) {

		StringBundler sb = new StringBundler(6);

		String toMessage = toSchemaVersion;

		if (UpgradeProcessUtil.isRequiredSchemaVersion(
				Version.parseVersion(fromSchemaVersion),
				Version.parseVersion(toSchemaVersion))) {

			toMessage += StringBundler.concat(
				StringPool.SPACE, StringPool.OPEN_PARENTHESIS, "REQUIRED",
				StringPool.CLOSE_PARENTHESIS);
		}

		sb.append(fromSchemaVersion);
		sb.append(" to ");
		sb.append(toMessage);
		sb.append(StringPool.COLON);
		sb.append(StringPool.SPACE);
		sb.append(upgradeClass.getName());

		return sb.toString();
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ReleaseManagerOSGiCommands.class);

	@Reference
	private ReleaseManagerImpl _releaseManagerImpl;

	@Reference
	private SwappedLogExecutor _swappedLogExecutor;

	@Reference
	private UpgradeExecutor _upgradeExecutor;

=======
	protected String getSchemaVersionString(String bundleSymbolicName) {
		String schemaVersionString = "0.0.0";

		Release release = _releaseLocalService.fetchRelease(bundleSymbolicName);

		if ((release != null) &&
			Validator.isNotNull(release.getSchemaVersion())) {

			schemaVersionString = release.getSchemaVersion();
		}

		return schemaVersionString;
	}

	protected Set<String> getUpgradableBundleSymbolicNames() {
		Set<String> upgradableBundleSymbolicNames = new HashSet<>();

		for (String bundleSymbolicName : _serviceTrackerMap.keySet()) {
			if (isUpgradable(bundleSymbolicName)) {
				upgradableBundleSymbolicNames.add(bundleSymbolicName);
			}
		}

		return upgradableBundleSymbolicNames;
	}

	protected boolean isUpgradable(String bundleSymbolicName) {
		String schemaVersionString = getSchemaVersionString(bundleSymbolicName);

		ReleaseGraphManager releaseGraphManager = new ReleaseGraphManager(
			_serviceTrackerMap.getService(bundleSymbolicName));

		List<List<UpgradeInfo>> upgradeInfosList =
			releaseGraphManager.getUpgradeInfosList(schemaVersionString);

		if (upgradeInfosList.size() == 1) {
			return true;
		}

		return false;
	}

	@Reference(unbind = "-")
	protected void setReleaseLocalService(
		ReleaseLocalService releaseLocalService) {

		_releaseLocalService = releaseLocalService;
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ReleaseManagerOSGiCommands.class);

	private boolean _activated;
	private ReleaseLocalService _releaseLocalService;
	private ServiceTrackerMap<String, List<UpgradeInfo>> _serviceTrackerMap;

	@Reference
	private SwappedLogExecutor _swappedLogExecutor;

	@Reference
	private UpgradeExecutor _upgradeExecutor;

	private static class UpgradeServiceTrackerCustomizer
		implements ServiceTrackerCustomizer<UpgradeStep, UpgradeInfo> {

		public UpgradeServiceTrackerCustomizer(BundleContext bundleContext) {
			_bundleContext = bundleContext;
		}

		@Override
		public UpgradeInfo addingService(
			ServiceReference<UpgradeStep> serviceReference) {

			String fromSchemaVersionString =
				(String)serviceReference.getProperty(
					"upgrade.from.schema.version");
			String toSchemaVersionString = (String)serviceReference.getProperty(
				"upgrade.to.schema.version");
			Object buildNumberObject = serviceReference.getProperty(
				"build.number");

			UpgradeStep upgradeStep = _bundleContext.getService(
				serviceReference);

			if (upgradeStep == null) {
				if (_log.isWarnEnabled()) {
					_log.warn(
						"Skipping service " + serviceReference +
							" because it does not implement UpgradeStep");
				}

				return null;
			}

			int buildNumber = 0;

			if (buildNumberObject == null) {
				try {
					Class<? extends UpgradeStep> clazz = upgradeStep.getClass();

					Configuration configuration =
						ConfigurationFactoryUtil.getConfiguration(
							clazz.getClassLoader(), "service");

					Properties properties = configuration.getProperties();

					buildNumber = GetterUtil.getInteger(
						properties.getProperty("build.number"));
				}
				catch (Exception exception) {
					if (_log.isDebugEnabled()) {
						_log.debug(
							"Unable to read service.properties for " +
								serviceReference);
					}
				}
			}
			else {
				buildNumber = GetterUtil.getInteger(buildNumberObject);
			}

			return new UpgradeInfo(
				fromSchemaVersionString, toSchemaVersionString, buildNumber,
				upgradeStep);
		}

		@Override
		public void modifiedService(
			ServiceReference<UpgradeStep> serviceReference,
			UpgradeInfo upgradeInfo) {
		}

		@Override
		public void removedService(
			ServiceReference<UpgradeStep> serviceReference,
			UpgradeInfo upgradeInfo) {

			_bundleContext.ungetService(serviceReference);
		}

		private final BundleContext _bundleContext;

	}

	private class UpgradeInfoServiceTrackerMapListener
		implements ServiceTrackerMapListener
			<String, UpgradeInfo, List<UpgradeInfo>> {

		@Override
		public void keyEmitted(
			ServiceTrackerMap<String, List<UpgradeInfo>> serviceTrackerMap,
			final String key, UpgradeInfo upgradeInfo,
			List<UpgradeInfo> upgradeInfos) {

			if (_activated && UpgradeStepRegistratorThreadLocal.isEnabled() &&
				(PropsValues.UPGRADE_DATABASE_AUTO_RUN ||
				 (_releaseLocalService.fetchRelease(key) == null))) {

				_upgradeExecutor.execute(key, upgradeInfos, null);
			}
		}

		@Override
		public void keyRemoved(
			ServiceTrackerMap<String, List<UpgradeInfo>> serviceTrackerMap,
			String key, UpgradeInfo upgradeInfo,
			List<UpgradeInfo> upgradeInfos) {
		}

	}

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
}