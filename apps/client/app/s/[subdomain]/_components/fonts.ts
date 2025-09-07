import {
  Inter,
  Poppins,
  Montserrat,
  Open_Sans,
  Roboto,
  Lato,
  Source_Sans_3,
  Nunito,
  Raleway,
  Ubuntu,
  Playfair_Display,
  Merriweather,
  Lora,
  Crimson_Text,
  Libre_Baskerville,
  Oswald,
  Bebas_Neue,
  Fjalla_One,
  Anton,
  Righteous,
} from "next/font/google";

// Modern Sans-Serif Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-open-sans",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-lato",
});

const sourceSansPro = Source_Sans_3({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-source-sans-pro",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-nunito",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-raleway",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
});

// Elegant Serif Fonts
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair-display",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-merriweather",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
});

const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson-text",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
});

// Bold Display Fonts
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-oswald",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas-neue",
});

const fjallaOne = Fjalla_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fjalla-one",
});

const anton = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-anton",
});

const righteous = Righteous({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-righteous",
});

// Export all fonts for use in components
export {
  inter,
  poppins,
  montserrat,
  openSans,
  roboto,
  lato,
  sourceSansPro,
  nunito,
  raleway,
  ubuntu,
  playfairDisplay,
  merriweather,
  lora,
  crimsonText,
  libreBaskerville,
  oswald,
  bebasNeue,
  fjallaOne,
  anton,
  righteous,
};

// Font mapping for dynamic font selection
export const fontMap = {
  "Inter, sans-serif": inter,
  "Poppins, sans-serif": poppins,
  "Montserrat, sans-serif": montserrat,
  "Open Sans, sans-serif": openSans,
  "Roboto, sans-serif": roboto,
  "Lato, sans-serif": lato,
  "Source Sans Pro, sans-serif": sourceSansPro,
  "Nunito, sans-serif": nunito,
  "Raleway, sans-serif": raleway,
  "Ubuntu, sans-serif": ubuntu,
  "Playfair Display, serif": playfairDisplay,
  "Merriweather, serif": merriweather,
  "Lora, serif": lora,
  "Crimson Text, serif": crimsonText,
  "Libre Baskerville, serif": libreBaskerville,
  "Oswald, sans-serif": oswald,
  "Bebas Neue, sans-serif": bebasNeue,
  "Fjalla One, sans-serif": fjallaOne,
  "Anton, sans-serif": anton,
  "Righteous, sans-serif": righteous,
} as const;
