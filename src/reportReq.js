const R = require('ramda');

const makeReportReq = (projectId, title) => {
  const req = {
    report_req: {
      definitionContent: {
        content: {
          reportDefinition: {
            content: {
              filters: [],
              format: 'grid',
              grid: {
                rows: [],
                columns: [],
                sort: {
                  columns: [],
                  rows: []
                },
                columnWidths: [],
                metrics: [
                  {
                    uri: `/gdc/md/${projectId}/obj/${metric_id}`,
                    alias: ''
                  }
                ]
              }
            },
            meta: {
              title: title,
              category: 'reportDefinition'
            }
          }
        },
        projectMetadata: `/gdc/md/${projectId}`
      }
    }
  }
  return req;
}

const getReportDefinitionPropPath = () =>
  ['report_req', 'definitionContent', 'content', 'reportDefinition'];

const addFilter = (req, filter) => {
  const propPath = [...getReportDefinitionPropPath(), 'content', 'filters'];
  const filters = [...R.path(propPath, req), filter];
  return R.assocPath(propPath, filters);
}

const addReportDefinitionProp = (req, path, value) => {
  const propPath = [...getReportDefinitionPropPath(), ...path];
  const newArr = [...R.path(propPath, req), value];
  return R.assocPath(propPath, newArr, req);
}

const addColumn = (req, column) => {
  return addReportDefinitionProp(req, ['content', 'grid', 'columns'], column);
}

const addRow = (req, row) => {
  return addReportDefinitionProp(req, ['content', 'grid', 'rows'], row);
}

const addMetric = (projectId, req, objId, label) => {
  const propPath = [...getReportDefinitionPropPath(), 'content', 'grid', 'metrics'];
  const metric = {
    uri: `/gdc/md/${projectId}/obj/${objId}`,
    alias: alias
  }
  return addReportDefinitionProp(req, ['content', 'grid', 'metrics'], metric);
}

const addAttribute = (projectId, req, objId, label) => {
  const alias = label || '';
  const attribute = {
    uri: `/gdc/md/${projectId}/obj/${objId}`,
    alias: alias
  };
  return addColumn(req, attribute);
}

const addDimension = (projectId, req, objId, label) => {
  const alias = label || '';
  const attribute = {
    uri: `/gdc/md/${projectId}/obj/${objId}`,
    alias: alias
  };
  return addRow(req, attribute);
}

const finalizeReq = (req, labelsOnTop) => {
  if (labelsOnTop)
    return addColumn(req, 'metricGroup')
  else
    return addRow(req, 'metricGroup')
}

const executeAdhocReport = (req) => {
  //TODO
};

module.exports = {
  makeReportReq,
  addAttribute,
  addDimension,
  addMetric,
  addFilter,
  finalizeReq,
  executeAdhocReport
};