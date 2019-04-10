const axios = require('axios');
const R = require('ramda');
const {makeGdAxiosConfig} = require('./cfg');

const getDatasets = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/datasets');
};

const getColumns = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/columns');
};

const getDimensions = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/dimensions');
};

const getReports = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/reports');
};

const getTables = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/tables');
};

const getObjectTypes = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/objects/query');
};

const getObject = R.curry((tempToken, wrkspcId, objId) => {
  return getProjectResource(tempToken, wrkspcId, `/obj/${objId}`);
});

const getObjIdFromUri = (uri) => {
  const reObjId = new RegExp('.+/obj/([0-9]+)');
  return reObjId.exec(uri)[1];
};

const getIdArgFromUri = (uri) => {
  console.log(`getIdArgFromUri from ${uri}`);
  const reObjId = new RegExp('.+id=([0-9]+)');
  return reObjId.exec(uri)[1];
};

const attributeProps = (attrib) => {
  const uri = R.path(['meta', 'uri'], attrib);
  const objId = getObjIdFromUri(uri);
  const identifier = R.path(['meta', 'identifier'], attrib);
  const title = R.path(['meta', 'title'], attrib);
  return {objId, identifier, title};
}

const attributeToStr = (props) => {
  return `attribute ${props.objId} [${props.identifier}] [${props.title}]`;
};

const getDimensionOutput = (dim, objId) => {
  //console.log('dimension:', dim);
  const title = R.path(['dimension', 'meta', 'title'], dim);
  const attribs = R.path(['dimension', 'content', 'attributes'], dim)
    .map(attributeProps)
    .map(attributeToStr).join('\n');
  return `--type dimension --object ${objId} [${title}]\n${attribs}`;
};

const getReportOutput = (report, objId) => {
  const title = R.path(['report', 'meta', 'title'], report);
  const defns = R.path(['report', 'content', 'definitions'], report)
    .map(getObjIdFromUri).map(objId => ` --type rptdefn --object ${objId}`).join('\n');
  return `--type report --object ${objId} [${title}]\n${defns}`;
};

const hasAttribute = R.has('attribute');

const getAttribForm = R.curry((tempToken, wrkspcId, attribRef) => {
  const objId = getObjIdFromUri(attribRef.attribute.uri);
  return getObject(tempToken, wrkspcId, objId);
});

const getAttribFormOutput = async (tempToken, wrkspcId, attribForm) => {
  const props = attribFormProps(attribForm);
  const attribElemsRes = await getProjectResource(
    tempToken,
    wrkspcId,
    `/obj/${props.objId}/elements`
  );
  const attribElemsStr = attribElemsRes.data.attributeElements.elements
    .map(attribElemProps)
    .map(attribElemToStr)
    .join('\n');
  return `${attribFormToStr(props)}\n${attribElemsStr}`;
};

const attribElemProps = (attribElem) => {
  const uri = R.prop('uri', attribElem);
  const objId = getIdArgFromUri(uri);
  const title = R.prop('title', attribElem);
  return {objId, title};
}

const attribElemToStr = (props) => {
  return `element ${props.objId} [${props.title}]`;
};

const attribFormToStr = (props) => {
  const {objId, title, attributeId} = props;
  return `--type attribForm --object ${objId} [${title}] for attribute ${attributeId}`;
};

const attribFormProps = (attribForm) => {
  const uri = R.path(['attributeDisplayForm', 'meta', 'uri'], attribForm);
  const objId = getObjIdFromUri(uri);
  const title = R.path(['attributeDisplayForm', 'meta', 'title'], attribForm);
  const attributeUri = R.path(
    ['attributeDisplayForm', 'content', 'formOf'],
    attribForm
  );
  const attributeId = getObjIdFromUri(attributeUri);
  return {objId, title, uri, attributeId};
};

const getReportDefnOutput = async (tempToken, wrkspcId, rptdefn, objId) => {
  const grid = R.path(['reportDefinition', 'content', 'grid'], rptdefn);
  const rowAttribs = grid.rows.filter(hasAttribute);
  const colAttribs = grid.columns.filter(hasAttribute);
  const attribRefs = [...rowAttribs, ...colAttribs];
  const attribFormsRes = await Promise.all(
    attribRefs.map(getAttribForm(tempToken, wrkspcId))
  );
  const attribForms = attribFormsRes.map(res => res.data);
  const attribFormsOutput = attribForms
    .map(attribFormProps).map(attribFormToStr).join('\n');
  return `--type rptdefn --object ${objId}\n${attribFormsOutput}`;
};

const columnProps = (column) => {
  const uri = R.path(['column', 'meta', 'uri'], column);
  const objId = getObjIdFromUri(uri);
  const colType = R.path(['column', 'content', 'columnType'], column);
  const colTblUri = R.path(['column', 'content', 'table'], column);
  const name = R.path(['column', 'content', 'columnDBName'], column);
  return {objId, name, uri, colType, colTblUri};
};

const columnToStr = (props) => {
  const {objId, name, colType} = props;
  return `--type column -o ${objId} [${name}] of type ${colType}`;
};

const tableProps = (table) => {
  const uri = R.path(['table', 'meta', 'uri'], table);
  const objId = getObjIdFromUri(uri);
  const name = R.path(['table', 'content', 'tableDBName'], table);
  return {objId, name, uri};
};

const getTblAndColFromColTitle = (title) => {
  const reTblAndCol = new RegExp('col\.([a-z_]+)\.([a-z_]+)');
  const reDateColumn = new RegExp('([a-z_0-9]+) \\((.+)\\)');
  let reResult = reTblAndCol.exec(title)
  if (! reResult) {
    console.log('title = ', title);
    reResult = reDateColumn.exec(title);
    return {tblName: reResult[2], colName: reResult[1]};
  }
  else
    return {tblName: reResult[1], colName: reResult[2]};
};

const inTable = R.curry((tblName, col) => {
  const title = col.title;
  const tblAndColNames = getTblAndColFromColTitle(title);
  return (tblAndColNames.tblName === tblName);
});

const getTableOutput = async (tempToken, wrkspcId, table, objId) => {
  const tblProps = tableProps(table);
  const colListRes = await getColumns(tempToken, wrkspcId);
  const colBriefs = colListRes.data.query.entries;
  console.log(`retrieved ${colBriefs.length} column briefs`);
  console.log(`table uri = ${tblProps.uri}`);
  const tblColBriefs = colBriefs.filter(inTable(tblProps.name));
  console.log(`filtered to ${tblColBriefs.length} table column briefs`);
  const tblColumns = await Promise.all(
    tblColBriefs
    .map(R.prop('link'))
    .map(getObjIdFromUri)
    .map(getObject(tempToken, wrkspcId))
  );
  const columnsOutput = tblColumns
    .map(res => res.data)
    .map(columnProps).map(columnToStr).join('\n');
  return `--type table --object ${objId} [${tblProps.name}]\n${columnsOutput}`;
};

const getProjectResource = (tempToken, wrkspcId, resourcePath) => {
  const gdAxiosConfig = makeGdAxiosConfig(tempToken);
  const url = `gdc/md/${wrkspcId}${resourcePath}`;
  return axios({...gdAxiosConfig, url});
};

module.exports = {
  getColumns,
  getDatasets,
  getDimensions,
  getObject,
  getObjectTypes,
  getReports,
  getTables,
  getAttribFormOutput,
  getDimensionOutput,
  getReportOutput,
  getReportDefnOutput,
  getTableOutput,
  getObjIdFromUri
}
