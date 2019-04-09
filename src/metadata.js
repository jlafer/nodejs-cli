const axios = require('axios');
const R = require('ramda');
const {makeGdAxiosConfig} = require('./cfg');

const getDatasets = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/datasets');
};

const getReports = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/query/reports');
};

const getObjectTypes = (tempToken, wrkspcId) => {
  return getProjectResource(tempToken, wrkspcId, '/objects/query');
};

const getObject = (tempToken, wrkspcId, objId) => {
  return getProjectResource(tempToken, wrkspcId, `/obj/${objId}`);
};

const getObjIdFromUri = (uri) => {
  const reObjId = new RegExp('.+/obj/([0-9]+)');
  return reObjId.exec(uri)[1];
};

const getIdArgFromUri = (uri) => {
  console.log(`getIdArgFromUri from ${uri}`);
  const reObjId = new RegExp('.+id=([0-9]+)');
  return reObjId.exec(uri)[1];
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

const getProjectResource = (tempToken, wrkspcId, resourcePath) => {
  const gdAxiosConfig = makeGdAxiosConfig(tempToken);
  const url = `gdc/md/${wrkspcId}${resourcePath}`;
  return axios({...gdAxiosConfig, url});
};

module.exports = {
  getDatasets,
  getObject,
  getObjectTypes,
  getReports,
  getReportOutput,
  getReportDefnOutput,
  getAttribFormOutput,
  getObjIdFromUri
}
