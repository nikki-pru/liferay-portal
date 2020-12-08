package ${apiPackagePath}.model;

<#if entity.hasCompoundPK()>
	import ${apiPackagePath}.service.persistence.${entity.name}PK;
</#if>

import java.sql.Blob;

/**
 * The Blob model class for lazy loading the ${column.name} column in ${entity.name}.
 *
 * @author ${author}
 * @see ${entity.name}
 * @generated
 */
public class ${entity.name}${column.methodName}BlobModel {

	public ${entity.name}${column.methodName}BlobModel() {
	}

	<#if entity.hasCompoundPK()>
		<#assign
			pkEntityMethodName = entity.PKClassName
			pkEntityType = entity.PKClassName
			pkEntityVariableName = entity.PKVariableName
		/>

	<#else>
		<#assign
			pkEntityColumn = entity.PKEntityColumns?first

			pkEntityMethodName = pkEntityColumn.methodName
			pkEntityType = pkEntityColumn.type
			pkEntityVariableName = pkEntityColumn.name
		/>
	</#if>

	public ${entity.name}${column.methodName}BlobModel(
		${pkEntityType} ${pkEntityVariableName}) {

		_${pkEntityVariableName} = ${pkEntityVariableName};
	}

	public ${entity.name}${column.methodName}BlobModel(
		${pkEntityType} ${pkEntityVariableName}, Blob ${column.name}Blob) {

		_${pkEntityVariableName} = ${pkEntityVariableName};
		_${column.name}Blob = ${column.name}Blob;
	}

	public ${pkEntityType} get${pkEntityMethodName}() {
		return _${pkEntityVariableName};
	}

	public void set${pkEntityMethodName}(${pkEntityType} ${pkEntityVariableName}) {
		_${pkEntityVariableName} = ${pkEntityVariableName};
	}

	public Blob get${column.methodName}Blob() {
		return _${column.name}Blob;
	}

	public void set${column.methodName}Blob(Blob ${column.name}Blob) {
		_${column.name}Blob = ${column.name}Blob;
	}

	private ${pkEntityType} _${pkEntityVariableName};

	private Blob _${column.name}Blob;

}