require('shelljs/global')
const path = require('path')
const pinyin = require('pinyin')

const combinations = (array) => {
  function combine(list) {
    let prefixes, combinations
    if(list.length === 1) return list[0]
    prefixes = list[0]
    combinations = combine(list.slice(1))
    return prefixes.reduce((memo, prefix) => memo.concat(combinations.map(combination => [prefix].concat(combination))), [])
  }
  return combine(array)
}
const pinyinArrayToStr = (input) => {
  return combinations(input).map(item => {
    return item.join('')
  }).join(' ')
}

exec('mdfind kind:app', { silent: true }, (code, stdout, stderr) => {
  if (code !== 0) return process.exit(1)
  stdout.split('\n').forEach(appPath => {
    if (!appPath) return
    exec(`chmod -R a+w '${appPath}'; mdls -name kMDItemDisplayName '${appPath}'`, { silent: true }, (code, stdout, stderr) => {
      if (code !== 0) return
      const match = stdout.match(/.*?"(.*?[\u4E00-\u9FA5\uF900-\uFA2D]+?.*?)"/)
      if (!match) return
      const name = match[1]
      const pinyinNormal = pinyinArrayToStr(pinyin(name, {
        heteronym: true,
        segment: true,
        style: pinyin.STYLE_NORMAL
      }))
      const pinyinFirstLetter = pinyinArrayToStr(pinyin(name, {
        heteronym: true,
        segment: true,
        style: pinyin.STYLE_FIRST_LETTER
      }))
      exec(`osascript -e 'tell application "Finder" to set comment of (POSIX file "${appPath}" as alias) to "${pinyinNormal} ${pinyinFirstLetter}"'`, { silent: true }, (code, stdout, stderr) => {
        if (code !== 0) return process.exit(3)
        console.log(`🚀 [${name}]: ${pinyinNormal} ${pinyinFirstLetter}`)
      })
    })
  })
})
