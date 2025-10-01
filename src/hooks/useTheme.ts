import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

export type Theme = {
  invitationCategory?: string;
  invitationFontFamily?: string;      // Fonte do convite
  invitationTextColor?: string;       // Cor do texto do convite
  invitationBgColor?: string;
  bgColor: string;
  bgTextColor: string;
  navBarColor: string;
  navBarShadow: boolean;
  navBarText: string;
  titleListGift: string;
  titleSelectedGift: string;
  whatsapp: string;
  listSelected: boolean;
  buttonColor: string;
  buttonTextColor: string;
  logoutButtonColor: string;
  logoutButtonTextColor: string;
  titleFontFamily: string;
  giftBorderColor: string;
  giftBgColor: string;
  giftButtonColor: string;
  giftTextColor: string;
  giftTextButtonColor: string;
  giftFontFamily: string;
  logoutButtonFontFamily?: string;
};

const THEME_DOC_ID = "59zMCCzevS9uOZumvxZ4";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>({
    bgColor: "",
    bgTextColor: "",
    navBarColor: "",
    navBarShadow: false,
    navBarText: "",
    titleListGift: "",
    titleSelectedGift: "",
    whatsapp: "",
    listSelected: false,
    buttonColor: "",
    buttonTextColor: "",
    logoutButtonColor: "",
    logoutButtonTextColor: "",
    titleFontFamily: "Montserrat", // ou uma fonte padrão, ex: "Montserrat"
    giftBorderColor: "",
    giftBgColor: "",
    giftButtonColor: "",
    giftTextColor: "",
    giftTextButtonColor: "",
    giftFontFamily: "",
    logoutButtonFontFamily: "Montserrat",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const themeRef = doc(db, "theme", THEME_DOC_ID);
    const unsubscribe = onSnapshot(themeRef, (snap) => {
      setTheme(snap.data() as Theme);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { theme, loading };
}