import { zhTranslations } from '../localization/zh';

type TranslationKey = keyof typeof zhTranslations;
type NestedTranslationKey<T> = {
  [K in keyof T]: T[K] extends object
    ? `${string & K}.${string & keyof T[K]}`
    : K;
}[keyof T];

export function useTranslation() {
  const t = (key: NestedTranslationKey<typeof zhTranslations>) => {
    const [category, messageKey] = key.split('.');
    if (!category || !messageKey) {
      return key;
    }

    const categoryMessages = zhTranslations[category as TranslationKey];
    if (!categoryMessages || typeof categoryMessages !== 'object') {
      return key;
    }

    const message = categoryMessages[messageKey as keyof typeof categoryMessages];
    return message || key;
  };

  return { t };
}