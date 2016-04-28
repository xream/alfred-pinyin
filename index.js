require('shelljs/global')
const path = require('path')
const pinyin = require('pinyin')

exec('mdfind kind:app', (code, stdout, stderr) => {
  if (code !== 0) return process.exit(1)
  const appPaths = stdout.split('\n').map(appPath => {
    if (!appPath.match(/[\u4E00-\u9FA5\uF900-\uFA2D]/)) return
    const name = path.basename(appPath, '.app')
    const pinyinNormal = pinyin(name, {
      heteronym: true,
      segment: true,
      style: pinyin.STYLE_NORMAL
    }).join('')
    const pinyinFirstLetter = pinyin(name, {
      heteronym: true,
      segment: true,
      style: pinyin.STYLE_FIRST_LETTER
    }).join('')
    appPath = appPath.replace(/ /g, '\\ ')

    exec(`osascript -e 'tell application "Finder" to set comment of (POSIX file "${appPath}" as alias) to "${pinyinNormal} ${pinyinFirstLetter}"'`, (code, stdout, stderr) => {
      if (code !== 0) return process.exit(2)
      console.log(`🚀 [${name}]: ${pinyinNormal} ${pinyinFirstLetter}`)
    })
  })
})
