export const uk = {
  cookies: {
    ariaLabel: "Cookie повідомлення",
    notice: "Ми використовуємо cookies для роботи сайту й аналітики.",
    policyLink: "Політика конфіденційності",
    dismiss: "Закрити повідомлення про cookies",
  },
  legal: {
    privacyTitle: "Політика конфіденційності",
    termsTitle: "Угода користувача",
    stubBody: "Документ редагується. Повна версія з'явиться найближчим часом.",
    stubContact: "Питання щодо обробки даних:",
  },
  loading: {
    stamp: "ДРУКУЄТЬСЯ",
    label: "Завантаження…",
  },
  errors: {
    widgetFallbackStamp: "ВІДБИТОК ЗМАЗАВСЯ",
    widgetFallbackBody: "Не вдалось показати:",
    widgetReset: "Друкувати знову",
    publicStamp: "АРКУШ ЗІМ'ЯВСЯ",
    publicHeadline: "Не вдалось викласти випуск",
    accountStamp: "КАБІНЕТ ЗАЧИНЕНИЙ",
    accountHeadline: "Не виходить відкрити кабінет",
    studentStamp: "ЗОШИТ ЗАГУБЛЕНО",
    studentHeadline: "Робочий зошит недоступний",
    adminStamp: "ШТАМП-ВІДДІЛ ЗАЧИНЕНО",
    adminHeadline: "Адмінка тимчасово недоступна",
    parentStamp: "КОРЕСПОНДЕНЦІЯ ЗАГУБЛЕНА",
    parentHeadline: "Сторінка батьків недоступна",
    reset: "Перезавантажити аркуш",
    backHome: "На головну",
    toLogin: "Увійти",
    legalStubStamp: "ДОКУМЕНТ ГОТУЄТЬСЯ",
  },
} as const;

export type UkStrings = typeof uk;
