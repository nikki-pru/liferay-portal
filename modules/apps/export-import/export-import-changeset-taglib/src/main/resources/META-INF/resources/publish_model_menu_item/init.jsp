<%--
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
--%>

<%@ include file="/init.jsp" %>

<%
String changesetUuid = GetterUtil.getString(request.getAttribute("liferay-export-import-changeset:publish-model-menu-item:changesetUuid"));
<<<<<<< HEAD

=======
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
String className = GetterUtil.getString(request.getAttribute("liferay-export-import-changeset:publish-model-menu-item:className"));
String uuid = GetterUtil.getString(request.getAttribute("liferay-export-import-changeset:publish-model-menu-item:uuid"));

boolean showMenuItem = ChangesetTaglibDisplayContext.isShowPublishMenuItem(group, portletDisplay.getId(), className, uuid);
%>