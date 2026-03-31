export const dictionaries: Record<string, () => Promise<any>> = {
  en: () => import('./en.json').then((module) => module.default || module),
  ko: () => import('./ko.json').then((module) => module.default || module),
  ja: () => import('./ja.json').then((module) => module.default || module),
  es: () => import('./es.json').then((module) => module.default || module),
  id: () => import('./id.json').then((module) => module.default || module),
}

export const getDictionary = async (locale: string) => {
  if (!dictionaries[locale]) return dictionaries['en']();
  return dictionaries[locale]();
}
