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

package com.liferay.exportimport.kernel.xstream;

/**
 * @author Máté Thurzó
 */
public class XStreamAlias {

	public XStreamAlias(Class<?> clazz, String name) {
<<<<<<< HEAD
		_clazz = clazz;
=======
		_class = clazz;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
		_name = name;
	}

	public Class<?> getClazz() {
<<<<<<< HEAD
		return _clazz;
=======
		return _class;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	}

	public String getName() {
		return _name;
	}

<<<<<<< HEAD
	private final Class<?> _clazz;
=======
	private final Class<?> _class;
>>>>>>> 3e5a7f2ba2444ba916b81b8bf4103e85fab48381
	private final String _name;

}