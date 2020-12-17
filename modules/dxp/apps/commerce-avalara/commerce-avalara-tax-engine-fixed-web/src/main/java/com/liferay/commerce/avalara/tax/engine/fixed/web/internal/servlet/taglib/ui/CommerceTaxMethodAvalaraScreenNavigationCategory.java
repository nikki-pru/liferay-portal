/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * The contents of this file are subject to the terms of the Liferay Enterprise
 * Subscription License ("License"). You may not use this file except in
 * compliance with the License. You can obtain a copy of the License by
 * contacting Liferay, Inc. See the License for the specific language governing
 * permissions and limitations under the License, including but not limited to
 * distribution rights of the Software.
 *
 *
 *
 */

package com.liferay.commerce.avalara.tax.engine.fixed.web.internal.servlet.taglib.ui;

<<<<<<< HEAD
import com.liferay.commerce.avalara.connector.configuration.CommerceAvalaraConnectorConfiguration;
import com.liferay.commerce.constants.CommerceTaxScreenNavigationConstants;
=======
import com.liferay.commerce.avalara.tax.engine.fixed.internal.configuration.CommerceTaxAvalaraTypeConfiguration;
import com.liferay.commerce.constants.CommerceTaxScreenNavigationConstants;
import com.liferay.commerce.currency.service.CommerceCurrencyLocalService;
import com.liferay.commerce.percentage.PercentageFormatter;
import com.liferay.commerce.product.model.CommerceChannel;
import com.liferay.commerce.product.service.CPTaxCategoryService;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.commerce.tax.model.CommerceTaxMethod;
import com.liferay.commerce.tax.service.CommerceTaxMethodService;
import com.liferay.frontend.taglib.servlet.taglib.ScreenNavigationCategory;
import com.liferay.frontend.taglib.servlet.taglib.ScreenNavigationEntry;
import com.liferay.frontend.taglib.servlet.taglib.util.JSPRenderer;
import com.liferay.portal.kernel.language.LanguageUtil;
import com.liferay.portal.kernel.model.User;
import com.liferay.portal.kernel.module.configuration.ConfigurationProvider;
<<<<<<< HEAD
=======
import com.liferay.portal.kernel.security.permission.resource.ModelResourcePermission;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
import com.liferay.portal.kernel.settings.GroupServiceSettingsLocator;
import com.liferay.portal.kernel.settings.ParameterMapSettingsLocator;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.ResourceBundleUtil;

import java.io.IOException;

import java.util.Locale;
import java.util.ResourceBundle;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Calvin Keum
 */
@Component(
<<<<<<< HEAD
	enabled = false,
=======
	enabled = true,
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	property = {
		"screen.navigation.category.order:Integer=20",
		"screen.navigation.entry.order:Integer=10"
	},
	service = {ScreenNavigationCategory.class, ScreenNavigationEntry.class}
)
public class CommerceTaxMethodAvalaraScreenNavigationCategory
	implements ScreenNavigationCategory,
			   ScreenNavigationEntry<CommerceTaxMethod> {

	public static final String CATEGORY_KEY = "settings";

	public static final String ENTRY_KEY = "settings";

	@Override
	public String getCategoryKey() {
		return CATEGORY_KEY;
	}

	@Override
	public String getEntryKey() {
		return ENTRY_KEY;
	}

	@Override
	public String getLabel(Locale locale) {
		ResourceBundle resourceBundle = ResourceBundleUtil.getBundle(
			"content.Language", locale, getClass());

		return LanguageUtil.get(resourceBundle, ENTRY_KEY);
	}

	@Override
	public String getScreenNavigationKey() {
		return CommerceTaxScreenNavigationConstants.
			SCREEN_NAVIGATION_KEY_COMMERCE_TAX_METHOD;
	}

	@Override
	public boolean isVisible(User user, CommerceTaxMethod commerceTaxMethod) {
		if (commerceTaxMethod == null) {
			return false;
		}

		String engineKey = commerceTaxMethod.getEngineKey();

		if (engineKey.equals("avalara")) {
			return true;
		}

		return false;
	}

	@Override
	public void render(
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws IOException {

		try {
			long commerceTaxMethodId = ParamUtil.getLong(
				httpServletRequest, "commerceTaxMethodId");

			CommerceTaxMethod commerceTaxMethod =
				_commerceTaxMethodService.getCommerceTaxMethod(
					commerceTaxMethodId);

<<<<<<< HEAD
			CommerceAvalaraConnectorConfiguration
				commerceAvalaraConnectorConfiguration =
					_configurationProvider.getConfiguration(
						CommerceAvalaraConnectorConfiguration.class,
=======
			CommerceTaxAvalaraTypeConfiguration
				commerceTaxAvalaraTypeConfiguration =
					_configurationProvider.getConfiguration(
						CommerceTaxAvalaraTypeConfiguration.class,
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
						new ParameterMapSettingsLocator(
							httpServletRequest.getParameterMap(),
							new GroupServiceSettingsLocator(
								commerceTaxMethod.getGroupId(),
<<<<<<< HEAD
								CommerceAvalaraConnectorConfiguration.class.
									getName())));

			httpServletRequest.setAttribute(
				CommerceAvalaraConnectorConfiguration.class.getName(),
				commerceAvalaraConnectorConfiguration);
=======
								CommerceTaxAvalaraTypeConfiguration.class.
									getName())));

			httpServletRequest.setAttribute(
				CommerceTaxAvalaraTypeConfiguration.class.getName(),
				commerceTaxAvalaraTypeConfiguration);
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		}
		catch (Exception exception) {
			throw new IOException(exception);
		}

		_jspRenderer.renderJSP(
			_servletContext, httpServletRequest, httpServletResponse,
			"/avalara_settings.jsp");
	}

<<<<<<< HEAD
=======
	@Reference(
		target = "(model.class.name=com.liferay.commerce.product.model.CommerceChannel)"
	)
	private ModelResourcePermission<CommerceChannel>
		_commerceChannelModelResourcePermission;

	@Reference
	private CommerceCurrencyLocalService _commerceCurrencyLocalService;

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	@Reference
	private CommerceTaxMethodService _commerceTaxMethodService;

	@Reference
	private ConfigurationProvider _configurationProvider;

	@Reference
<<<<<<< HEAD
	private JSPRenderer _jspRenderer;

=======
	private CPTaxCategoryService _cpTaxCategoryService;

	@Reference
	private JSPRenderer _jspRenderer;

	@Reference
	private PercentageFormatter _percentageFormatter;

>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	@Reference(
		target = "(osgi.web.symbolicname=com.liferay.commerce.avalara.tax.engine.fixed.web)"
	)
	private ServletContext _servletContext;

}