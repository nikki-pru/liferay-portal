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

package com.liferay.layout.internal.instance.lifecycle;

import com.liferay.fragment.contributor.FragmentCollectionContributorRegistration;
import com.liferay.layout.internal.importer.DefaultLayoutDefinitionImporter;
import com.liferay.layout.util.LayoutCopyHelper;
import com.liferay.petra.string.StringPool;
import com.liferay.portal.instance.lifecycle.BasePortalInstanceLifecycleListener;
import com.liferay.portal.instance.lifecycle.PortalInstanceLifecycleListener;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.model.Company;
import com.liferay.portal.kernel.model.Group;
import com.liferay.portal.kernel.model.GroupConstants;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.LayoutConstants;
import com.liferay.portal.kernel.model.LayoutSet;
import com.liferay.portal.kernel.model.LayoutTemplate;
import com.liferay.portal.kernel.model.LayoutTypePortlet;
<<<<<<< HEAD
import com.liferay.portal.kernel.model.Role;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.model.role.RoleConstants;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.portal.kernel.module.framework.ModuleServiceLifecycle;
import com.liferay.portal.kernel.security.auth.PrincipalThreadLocal;
import com.liferay.portal.kernel.service.GroupLocalService;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.service.LayoutSetLocalService;
<<<<<<< HEAD
import com.liferay.portal.kernel.service.RoleLocalService;
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.portal.kernel.service.ServiceContext;
import com.liferay.portal.kernel.service.ServiceContextThreadLocal;
import com.liferay.portal.kernel.service.UserLocalService;
import com.liferay.portal.kernel.util.FriendlyURLNormalizerUtil;
import com.liferay.portal.kernel.util.Portal;
import com.liferay.portal.kernel.util.PropsKeys;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;
import com.liferay.portal.kernel.workflow.WorkflowConstants;
import com.liferay.portal.util.PropsUtil;
import com.liferay.portal.util.PropsValues;

<<<<<<< HEAD
import java.util.List;

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Pavel Savinov
 */
@Component(immediate = true, service = PortalInstanceLifecycleListener.class)
public class AddDefaultLayoutPortalInstanceLifecycleListener
	extends BasePortalInstanceLifecycleListener {

	@Override
	public void portalInstanceRegistered(Company company) throws Exception {
		Group group = _groupLocalService.getGroup(
			company.getCompanyId(), GroupConstants.GUEST);

		Layout defaultLayout = _layoutLocalService.fetchFirstLayout(
			group.getGroupId(), false, LayoutConstants.DEFAULT_PARENT_LAYOUT_ID,
			false);

		if (defaultLayout == null) {
			addDefaultGuestPublicLayoutByProperties(group);
		}
	}

	protected void addDefaultGuestPublicLayoutByProperties(Group group)
		throws PortalException {

<<<<<<< HEAD
		User user = _getUser(group.getCompanyId());

=======
		long defaultUserId = _userLocalService.getDefaultUserId(
			group.getCompanyId());
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		String friendlyURL = FriendlyURLNormalizerUtil.normalizeWithEncoding(
			PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_FRIENDLY_URL);

		ServiceContext serviceContext = new ServiceContext();

		Layout layout = _layoutLocalService.addLayout(
<<<<<<< HEAD
			user.getUserId(), group.getGroupId(), false,
=======
			defaultUserId, group.getGroupId(), false,
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			LayoutConstants.DEFAULT_PARENT_LAYOUT_ID,
			PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_NAME, StringPool.BLANK,
			StringPool.BLANK, LayoutConstants.TYPE_CONTENT, false, friendlyURL,
			serviceContext);

		Layout draftLayout = layout.fetchDraftLayout();

		String currentName = PrincipalThreadLocal.getName();
		ServiceContext currentServiceContext =
			ServiceContextThreadLocal.popServiceContext();

		PrincipalThreadLocal.setName(String.valueOf(layout.getUserId()));
		ServiceContextThreadLocal.pushServiceContext(serviceContext);

		try {
			_defaultLayoutDefinitionImporter.importDefaultLayoutDefinition(
				draftLayout, serviceContext);

			layout = _layoutCopyHelper.copyLayout(draftLayout, layout);

<<<<<<< HEAD
			LayoutTypePortlet layoutTypePortlet =
				(LayoutTypePortlet)layout.getLayoutType();

			layoutTypePortlet.setLayoutTemplateId(
				0, PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_TEMPLATE_ID, false);

			LayoutTemplate layoutTemplate =
				layoutTypePortlet.getLayoutTemplate();

			for (String columnId : layoutTemplate.getColumns()) {
				String keyPrefix = PropsKeys.DEFAULT_GUEST_PUBLIC_LAYOUT_PREFIX;

				String portletIds = PropsUtil.get(keyPrefix.concat(columnId));

				layoutTypePortlet.addPortletIds(
					0, StringUtil.split(portletIds), columnId, false);
			}

			_layoutLocalService.updateLayout(
				layout.getGroupId(), layout.isPrivateLayout(),
				layout.getLayoutId(), layout.getTypeSettings());

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
			_layoutLocalService.updatePriority(
				layout.getPlid(), LayoutConstants.FIRST_PRIORITY);

			_layoutLocalService.updateStatus(
				layout.getUserId(), layout.getPlid(),
				WorkflowConstants.STATUS_APPROVED, serviceContext);

			_layoutLocalService.updateStatus(
				layout.getUserId(), draftLayout.getPlid(),
				WorkflowConstants.STATUS_APPROVED, serviceContext);
<<<<<<< HEAD

			boolean updateLayoutSet = false;

			LayoutSet layoutSet = layout.getLayoutSet();

			if (Validator.isNotNull(
					PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_THEME_ID)) {

				layoutSet.setThemeId(
					PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_THEME_ID);

				updateLayoutSet = true;
			}

			if (Validator.isNotNull(
					PropsValues.
						DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_COLOR_SCHEME_ID)) {

				layoutSet.setColorSchemeId(
					PropsValues.
						DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_COLOR_SCHEME_ID);

				updateLayoutSet = true;
			}

			if (updateLayoutSet) {
				_layoutSetLocalService.updateLayoutSet(layoutSet);
			}
		}
		catch (Exception exception) {
			throw new PortalException(exception);
		}
		finally {
			PrincipalThreadLocal.setName(currentName);
			ServiceContextThreadLocal.pushServiceContext(currentServiceContext);
=======
		}
		catch (Exception exception) {
			throw new PortalException(exception);
		}
		finally {
			PrincipalThreadLocal.setName(currentName);
			ServiceContextThreadLocal.pushServiceContext(currentServiceContext);
		}

		LayoutTypePortlet layoutTypePortlet =
			(LayoutTypePortlet)layout.getLayoutType();

		layoutTypePortlet.setLayoutTemplateId(
			0, PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_TEMPLATE_ID, false);

		LayoutTemplate layoutTemplate = layoutTypePortlet.getLayoutTemplate();

		for (String columnId : layoutTemplate.getColumns()) {
			String keyPrefix = PropsKeys.DEFAULT_GUEST_PUBLIC_LAYOUT_PREFIX;

			String portletIds = PropsUtil.get(keyPrefix.concat(columnId));

			layoutTypePortlet.addPortletIds(
				0, StringUtil.split(portletIds), columnId, false);
		}

		_layoutLocalService.updateLayout(
			layout.getGroupId(), layout.isPrivateLayout(), layout.getLayoutId(),
			layout.getTypeSettings());

		boolean updateLayoutSet = false;

		LayoutSet layoutSet = layout.getLayoutSet();

		if (Validator.isNotNull(
				PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_THEME_ID)) {

			layoutSet.setThemeId(
				PropsValues.DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_THEME_ID);

			updateLayoutSet = true;
		}

		if (Validator.isNotNull(
				PropsValues.
					DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_COLOR_SCHEME_ID)) {

			layoutSet.setColorSchemeId(
				PropsValues.
					DEFAULT_GUEST_PUBLIC_LAYOUT_REGULAR_COLOR_SCHEME_ID);

			updateLayoutSet = true;
		}

		if (updateLayoutSet) {
			_layoutSetLocalService.updateLayoutSet(layoutSet);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		}
	}

	@Reference(
		target = "(fragment.collection.key=BASIC_COMPONENT)", unbind = "-"
	)
	protected void setFragmentCollectionContributorRegistration(
		FragmentCollectionContributorRegistration
			fragmentCollectionContributorRegistration) {
	}

	@Reference(target = ModuleServiceLifecycle.PORTAL_INITIALIZED, unbind = "-")
	protected void setModuleServiceLifecycle(
		ModuleServiceLifecycle moduleServiceLifecycle) {
	}

<<<<<<< HEAD
	private User _getUser(long companyId) throws PortalException {
		Role role = _roleLocalService.fetchRole(
			companyId, RoleConstants.ADMINISTRATOR);

		if (role == null) {
			return _userLocalService.getDefaultUser(companyId);
		}

		List<User> adminUsers = _userLocalService.getRoleUsers(
			role.getRoleId(), 0, 1);

		if (adminUsers.isEmpty()) {
			return _userLocalService.getDefaultUser(companyId);
		}

		return adminUsers.get(0);
	}

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	@Reference
	private DefaultLayoutDefinitionImporter _defaultLayoutDefinitionImporter;

	@Reference
	private GroupLocalService _groupLocalService;

	@Reference
	private LayoutCopyHelper _layoutCopyHelper;

	@Reference
	private LayoutLocalService _layoutLocalService;

	@Reference
	private LayoutSetLocalService _layoutSetLocalService;

	@Reference
	private Portal _portal;

	@Reference
<<<<<<< HEAD
	private RoleLocalService _roleLocalService;

	@Reference
=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	private UserLocalService _userLocalService;

}