'use strict'

const toBlue = (projectJson, apiJson) => {
  const projectStr = parseProject(projectJson)
  const resultStr = apiJson ? apiJson.reduce((result, apiItem, index) => {
    result += `${parseBlue(apiItem)}\n\n`
    return result
  }, '') : ''
  return `FORMAT: 1A\n\n${projectStr}\n\n${resultStr}`
}

const parseBlue = (apiObj) => {
  const result = []
  result.push(parseTitle(apiObj))
  result.push(parseParameter(apiObj))
  result.push(parseResponse(apiObj))
  return result.join('\n\n')
}

const parseProject = (project) => {
  if (!project) return ''
  const title = `# ${project.title}` || ''
  const description = `${project.description}` || ''
  const host = `HOST: ${project.url}` || ''
  const header = project.header ? `## ${project.header.title}\n\n${project.header.content}` : ''
  const footer = project.footer ? `## ${project.footer.title}\n\n${project.footer.content}` : ''
  return [host, title, description, header, footer].join('\n\n')
}

const parseTitle = (apiObj) => {
  const method = apiObj.type.toUpperCase()
  let path = /^\/\w?/.test(apiObj.url) ? apiObj.url : `/${apiObj.url}`
  // :id to {id}
  path = path.replace(/(:\w+)$/, (match, p1, offset, string) => {
    const newp1 = p1.replace(':', '')
    return `{${newp1}}`
  })
  /* eslint-disable no-nested-ternary */
  const title = apiObj.title ? apiObj.title : ''
  const description = apiObj.description ? apiObj.description : ''
  return `# ${method} ${path}\n\n${title}${description}`
}

const parseParameter = (apiObj) => {
  const parameters = apiObj.parameter && apiObj.parameter.fields &&
    apiObj.parameter.fields.Parameter
    ? apiObj.parameter.fields.Parameter : []
  const resultStr = parameters.reduce((result, item, index) => {
    const type = item.type ? item.type.toLowerCase() : ''
    const defaultValue = item.defaultValue ? `\n 默认值是：<code>${item.defaultValue}</code>` : ''
    const itemStr = `    + ${item.field.replace(':', '')} (${type}${item.optional ? ', optional' : ''}) ... ${item.description}${defaultValue}`
    result.push(itemStr)
    return result
  }, ['+ Parameters\n'])
  return resultStr.join('\n')
}

const parseResponse = (apiObj) => {
  const result = []
  apiObj.success && result.push(parseResItem(apiObj.success))
  apiObj.error && result.push(parseResItem(apiObj.error))
  return result.join('\n\n')
}

const parseResItem = (itemObj) => {
  const fields = itemObj.fields || []
  const resultStr = Object.keys(fields).reduce((result, item, index) => {
    result.push(`+ Response ${item.replace(/\w+\s+/g, '')}\n`)
    const itemStr = `    + Attributes (object)\n\n${parseAttributes(fields[item])}`
    result.push(itemStr)
    return result
  }, []).join('\n')
  const examplesStr = parseExample(itemObj.examples)
  return `${resultStr}\n\n${examplesStr}`
}

const parseAttributes = (fields) => {
  return fields.map(item => {
    const fields = item.field.split('.')
    const fieldName = fields[fields.length - 1]
    const indention = '    '.repeat(fields.length + 1)
    return `${indention}+ ${fieldName} (${getType(item.type)}) - ${item.description}`
  }).join('\n')
}

const getType = (type) => {
  const lower = type ? type.toLowerCase() : ''
  const map = {
    integer: 'number',
    bigint: 'number',
    int: 'number',
    bool: 'boolean',
    datetime: 'string',
    date: 'string',
    xlsx: 'string',
    file: 'string'
  }
  return map[lower] || lower
}

const parseExample = (examples) => {
  if (!examples) {
    examples = []
  }
  return examples.reduce((result, item, index) => {
    const content = fillStr(item.content, 8, ' ')
    result.push(content)
    return result
  }, [`    + Body\n`]).join('\n')
}

const fillStr = (content, num, str) => {
  const resultStr = content.split('\n').reduce((result, item) => {
    const arr = new Array(num).fill(str)
    arr.push(item)
    result.push(arr.join(''))
    return result
  }, []).join('\n')
  return resultStr
}

module.exports = {
  toBlue
}
