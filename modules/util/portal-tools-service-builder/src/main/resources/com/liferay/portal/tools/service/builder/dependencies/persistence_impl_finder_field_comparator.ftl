<#if entityColumn.comparator == "=">
	<#if entityColumn.isPrimitiveType(false)>
		<#if stringUtil.equals(entityColumn.type, "boolean")>
			(${entityColumn.name} != ${entity.variableName}.is${entityColumn.methodName}())
		<#else>
			(${entityColumn.name} != ${entity.variableName}.get${entityColumn.methodName}())
		</#if>
	<#elseif stringUtil.equals(entityColumn.type, "String") && entityColumn.isConvertNull()>
		!${entityColumn.name}.equals(${entity.variableName}.get${entityColumn.methodName}())
	<#else>
		!Objects.equals(${entityColumn.name}, ${entity.variableName}.get${entityColumn.methodName}())
	</#if>
<#elseif entityColumn.comparator == "!=">
	<#if entityColumn.isPrimitiveType(false)>
		<#if stringUtil.equals(entityColumn.type, "boolean")>
			(${entityColumn.name} == ${entity.variableName}.is${entityColumn.methodName}())
		<#else>
			(${entityColumn.name} == ${entity.variableName}.get${entityColumn.methodName}())
		</#if>
	<#elseif stringUtil.equals(entityColumn.type, "String") && entityColumn.isConvertNull()>
		${entityColumn.name}.equals(${entity.variableName}.get${entityColumn.methodName}())
	<#else>
		Objects.equals(${entityColumn.name}, ${entity.variableName}.get${entityColumn.methodName}())
	</#if>
<#elseif entityColumn.comparator == ">">
	<#if stringUtil.equals(entityColumn.type, "BigDecimal")>
		(${entityColumn.name}.compareTo(${entity.variableName}.get${entityColumn.methodName}()) >= 0)
	<#elseif stringUtil.equals(entityColumn.type, "Date")>
		(${entityColumn.name}.getTime() >= ${entity.variableName}.get${entityColumn.methodName}().getTime())
	<#else>
		(${entityColumn.name} >= ${entity.variableName}.get${entityColumn.methodName}())
	</#if>
<#elseif entityColumn.comparator == ">=">
	<#if stringUtil.equals(entityColumn.type, "BigDecimal")>
		(${entityColumn.name}.compareTo(${entity.variableName}.get${entityColumn.methodName}()) > 0)
	<#elseif stringUtil.equals(entityColumn.type, "Date")>
		(${entityColumn.name}.getTime() > ${entity.variableName}.get${entityColumn.methodName}().getTime())
	<#else>
		(${entityColumn.name} > ${entity.variableName}.get${entityColumn.methodName}())
	</#if>
<#elseif entityColumn.comparator == "<">
	<#if stringUtil.equals(entityColumn.type, "BigDecimal")>
		(${entityColumn.name}.compareTo(${entity.variableName}.get${entityColumn.methodName}()) <= 0)
	<#elseif stringUtil.equals(entityColumn.type, "Date")>
		(${entityColumn.name}.getTime() <= ${entity.variableName}.get${entityColumn.methodName}().getTime())
	<#else>
		(${entityColumn.name} <= ${entity.variableName}.get${entityColumn.methodName}())
	</#if>
<#elseif entityColumn.comparator == "<=">
	<#if stringUtil.equals(entityColumn.type, "BigDecimal")>
		(${entityColumn.name}.compareTo(${entity.variableName}.get${entityColumn.methodName}()) < 0)
	<#elseif stringUtil.equals(entityColumn.type, "Date")>
		(${entityColumn.name}.getTime() < ${entity.variableName}.get${entityColumn.methodName}().getTime())
	<#else>
		(${entityColumn.name} < ${entity.variableName}.get${entityColumn.methodName}())
	</#if>
<#elseif stringUtil.equals(entityColumn.comparator, "LIKE")>
	!StringUtil.wildcardMatches(${entity.variableName}.get${entityColumn.methodName}(), ${entityColumn.name}, '_', '%', '\\',
	<#if entityColumn.isCaseSensitive()>
		true
	<#else>
		false
	</#if>
	)
</#if>