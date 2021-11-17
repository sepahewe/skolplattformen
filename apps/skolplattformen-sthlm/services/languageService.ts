import merge from 'deepmerge'
import i18n from 'i18n-js'
import moment from 'moment'
import 'moment/locale/ar'
import 'moment/locale/de'
import 'moment/locale/es'
import 'moment/locale/fi'
import 'moment/locale/fr'
import 'moment/locale/it'
import 'moment/locale/ja'
import 'moment/locale/nb'
import 'moment/locale/nl'
import 'moment/locale/pl'
import 'moment/locale/pt'
import 'moment/locale/ru'
import 'moment/locale/sv'
import 'moment/locale/zh-cn'
import { I18nManager } from 'react-native'

const changeListeners: Record<string, any> = {}

let allString: Record<string, any> = {}

let Strings: Record<string, any> = {}
let languageCode: string

const rtlList: { [key: string]: boolean } = {
  en: false,
  de: false,
  pl: false,
  sv: false,
  so: false,
  ar: true,
}

export const isRTL = (langCode: string) => {
  if (!Object.prototype.hasOwnProperty.call(rtlList, langCode)) {
    return false
  }
  return rtlList[langCode]
}

const getCorrespondingMomentLocale = (langCode?: string): string => {
  if (langCode === 'la') return 'sv'
  if (langCode === 'so') return 'sv'
  if (langCode === 'nb_NO') return 'nb'
  if (langCode === 'zh_Hant' || langCode === 'zh_Hans') return 'zh-cn'
  return langCode!
}

export const LanguageService = {
  get: () => Strings,
  getLanguageCode: () => languageCode,
  setAllData: ({ data }: { data: Record<string, any> }) => {
    allString = data
  },
  seti18nConfig: ({ langCode }: { langCode?: string }) => {
    i18n.defaultLocale = 'sv'
    if (langCode) {
      i18n.translations = { [langCode]: Strings }
      i18n.locale = langCode
      I18nManager.forceRTL(isRTL(langCode))
    }
    moment.locale(getCorrespondingMomentLocale(langCode))
  },
  setLanguageCode: ({ langCode }: { langCode?: string }) => {
    if (langCode && allString[langCode]) {
      languageCode = langCode
      Strings = merge(allString.sv, allString[langCode])
    } else {
      const dataKeys = Object.keys(allString)
      languageCode = dataKeys[0]
      Strings = allString[languageCode]
    }
    Object.keys(changeListeners).forEach((k) => {
      changeListeners[k](langCode)
    })
    return Strings
  },
  onChange: ({ key }: { key: string }, cb: (langCode: string) => void) => {
    const unsubscribe = () => {
      delete changeListeners[key]
    }
    changeListeners[key] = (langCode: string) => cb(langCode)

    return unsubscribe
  },
}

export const i18nService = i18n
