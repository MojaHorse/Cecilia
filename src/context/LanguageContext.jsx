import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  sesotho: {
    nav_home: 'Lehae',
    nav_hymns: 'Lifela',
    nav_prayers: 'Merapelo',
    nav_mass: "Tsamaiso ea 'Misa",
    nav_about: 'Ka Rona',
    tagline: 'Difela Tsa Bakatolike',
    footer_verse: '"O binele Morena sefela se secha" — Pesalema 98:1',
    footer_source_hymns: 'Lifela li nkiloe ho',
    footer_source_church: 'Litaba ho tsoa',
    holy_church: 'Kereke e Halalelang',
    home_title: 'Sefela se Secha',
    home_subtitle: 'Ua amoheloa lenaneong la inthanete la difela le merapelo e tloaelehileng ea Kereke e Katolike.',
    home_btn_hymns: 'Bula Lifela',
    home_btn_mass: 'Tsamaiso ea Misa',
    home_btn_prayers: 'Bula Merapelo',
    home_mission_title: "Ho Boloka Setso sa Tumelo",
    home_mission_text: "Re boloka le ho abelana lifela tsa Kereke ea Katolike. Lipina tsena ke karolo ea boholo ea tumelo ea rona le setso sa rona. Lebitso la rona, 'The Good Shepherd', le re hopotsa hore Jesu ke Molisa ea Molemo ea re tataisang, 'me re mo rorisa ka lipina.",
    home_mission_btn: "Bala Haholoanyane",
    home_news_title: "Litaba tsa Vatican",
    home_news_subtitle: "Mangolo, melaetsa, le liketsahalo tse ncha ho tsoa ho Mopapa le Kereke e Halalelang.",
    home_featured_label: "Sefela sa Letsatsi",
    home_featured_btn: "Bala sefela kaofela →",
    about_title: "Ka",
    about_p1: "The Good Shepherd ke sebaka sa marang-rang se entsoe ho boloka le ho abelana lifela tsa Kereke ea Katolike. Lebitso lena le bolela 'Molisa ea Molemo' — ho re hopotsa hore Molisa oa rona o re bitsa hore re mo rorise.",
    about_p2: "Sebaka sena se na le lifela tse nkiloeng ho Lifela Tsa BaKriste le mehloli e meng, e leng mohloli o moholo oa lifela tsa Bakatolike. Re leboha ba entseng mosebetsi o moholo oa ho boloka lipina tsena.",
    about_p3: "Sepheo sa rona ke hore batho ba fumane lifela tsena habonolo — leha ba le kerekeng, lapeng, kapa leeto-tseleng. Lipina tsena ke karolo ea boholo ea tumelo ea rona le setso sa rona."
  },
  zulu: {
    nav_home: 'Ikhaya',
    nav_hymns: 'Amaculo',
    nav_prayers: 'Imithandazo',
    nav_mass: 'Inqubo yeMisa',
    nav_about: 'Mayelana Nathi',
    tagline: 'Amaculo amaKhatholika',
    footer_verse: '"Mhubeleni iNkosi ihubo elisha" — AmaHubo 98:1',
    footer_source_hymns: 'Amaculo athathwe ku',
    footer_source_church: 'Ulwazi luvela ku',
    holy_church: 'ISonto eNgcwele',
    home_title: 'Ihubo Elisha',
    home_subtitle: 'Siyakwamukela kule ngosi yama-inthanethi yamaculo nemithandazo ejwayelekile yeSonto lamaKhatholika.',
    home_btn_hymns: 'Vula Amaculo',
    home_btn_mass: 'Inqubo yeMisa',
    home_btn_prayers: 'Vula Imithandazo',
    home_mission_title: "Ukugcina Amasiko Okukholwa",
    home_mission_text: "Sigcina futhi sabelana ngamaculo eSonto lamaKhatholika. Lezi zingoma ziyingxenye enkulu yokholo lwethu namasiko ethu. Igama lethu elithi 'The Good Shepherd' lisikhumbuza ukuthi uJesu unguMalusi Omuhle osiholayo, futhi simdumuza ngengoma.",
    home_mission_btn: "Funda Kabanzi",
    home_news_title: "Izindaba ze-Vatican",
    home_news_subtitle: "Izincwadi, imiyalezo, nezehlakalo zakamuva ezivela kuPapa neSonto eNgcwele.",
    home_featured_label: "Iculo Losuku",
    home_featured_btn: "Funda iculo lonke →",
    about_title: "Mayelana Ne",
    about_p1: "I-The Good Shepherd iyinkundla ye-inthanethi edalelwe ukugcina nokwabelana ngamaculo eSonto lamaKhatholika. Leli gama lisho 'UMalusi Omuhle' — ukusikhumbuza ukuthi uMalusi wethu usibiza ukuba simdumuze.",
    about_p2: "Leli sayithi liqukethe iqoqo lamaculo obuKhatholika athathwe ezincwadini zamaculo ezethembekile. Sibonga labo abenze umsebenzi omkhulu wokulondoloza lezi zingoma.",
    about_p3: "Umgomo wethu ukwenza ukuthi lawa maculo afinyeleleke kalula ebantwini — kungakhathaliseki ukuthi basesontweni, ekhaya, noma basendleleni. Lezi zingoma ziyingxenye enkulu yokholo lwethu namasiko ethu."
  },
  xhosa: {
    nav_home: 'Ikhaya',
    nav_hymns: 'Amaculo',
    nav_prayers: 'Imithandazo',
    nav_mass: 'UMthetho weMisa',
    nav_about: 'Ngathi',
    tagline: 'Amaculo amaKatolika',
    footer_verse: '"Mvumeleni uNdikhoyo ingoma entsha" — INdumiso 98:1',
    footer_source_hymns: 'Amaculo athatyathwe ku',
    footer_source_church: 'Ulwazi luvela ku',
    holy_church: 'ICawe eNgcwele',
    home_title: 'Ingoma Entsha',
    home_subtitle: 'Wamkelekile kule webhusayithi yamaculo nemithandazo yeCawe yamaKatolika.',
    home_btn_hymns: 'Vula Amaculo',
    home_btn_mass: 'UMthetho weMisa',
    home_btn_prayers: 'Vula Imithandazo',
    home_mission_title: "Ukugcina Isiko Lokholo",
    home_mission_text: "Sigcina kwaye sabelane ngamaculo eCawe yamaKatolika. Ezi ngoma ziyinxalenye enkulu yokholo lwethu nenkcubeko yethu. Igama lethu elithi 'The Good Shepherd' lisikhumbuza ukuba uYesu unguMalusi Olungileyo osikhokelayo, kwaye simdumisa ngengoma.",
    home_mission_btn: "Funda Ngakumbi",
    home_news_title: "Iindaba ze-Vatican",
    home_news_subtitle: "Iincwadi, imiyalezo, neziganeko zamva nje ezivela kuPopu neCawe eNgcwele.",
    home_featured_label: "Ingoma Yosuku",
    home_featured_btn: "Funda ingoma yonke →",
    about_title: "Nge",
    about_p1: "I-The Good Shepherd liqonga le-intanethi elenzelwe ukugcina nokwabelana ngamaculo eCawe yamaKatolika. Eli gama lithetha 'UMalusi Olungileyo' — ukusikhumbuza ukuba uMalusi wethu usibiza ukuba simdumuze.",
    about_p2: "Le sayithi inengqokelela yamaculo obuKatolika athatyathwe kwiincwadi zamaculo ezithembekileyo. Sibulela abo benze umsebenzi omkhulu wokulondoloza ezi ngoma.",
    about_p3: "Injongo yethu kukwenza ukuba la maculo afikeleleke lula ebantwini — nokuba kusecaweni, ekhaya, okanye endleleni. Ezi ngoma ziyinxalenye enkulu yokholo lwethu nenkcubeko yethu."
  },
  setswana: {
    nav_home: 'Gae',
    nav_hymns: 'Difela',
    nav_prayers: 'Merapelo',
    nav_mass: 'Tsamaiso ya Misa',
    nav_about: 'Ka Rona',
    tagline: 'Difela Tsa Bakatolike',
    footer_verse: '"Mopeleleng Morena sefela se sesha" — Pesalema 98:1',
    footer_source_hymns: 'Difela di tserwe go',
    footer_source_church: 'Tshedimosetso go tswa',
    holy_church: 'Kereke e e Boitshepo',
    home_title: 'Sefela se Sesha',
    home_subtitle: 'O amogetswe mo webosaeteng ya difela le merapelo ya Kereke e e Katoliki.',
    home_btn_hymns: 'Bula Difela',
    home_btn_mass: 'Tsamaiso ya Misa',
    home_btn_prayers: 'Bula Merapelo',
    home_mission_title: "Go Somarela Ngwao ya Tumelo",
    home_mission_text: "Re somarela le go abelana difela tsa Kereke e e Katoliki. Dipina tse ke karolo e tona ya tumelo ya rona le ngwao ya rona. Leina la rona, 'The Good Shepherd', le re gopotsa gore Jesu ke Modisa yo o Molemo yo o re kaelang, mme re mo rorisa ka pina.",
    home_mission_btn: "Bala Go Fetlha Fao",
    home_news_title: "Dikgang tsa Vatican",
    home_news_subtitle: "Makwalo, melaetsa, le ditiragalo tsa bosheng go tswa go Mopapa le Kereke e e Boitshepo.",
    home_featured_label: "Sefela sa Letsatsi",
    home_featured_btn: "Bala sefela sotlhe →",
    about_title: "Ka",
    about_p1: "The Good Shepherd ke lefelo la inthanete le le diretsweng go somarela le go abelana difela tsa Kereke e e Katoliki. Leina le raya 'Modisa yo o Molemo' — go re gopotsa gore Modisa wa rona o re bitsa gore re mo rorise.",
    about_p2: "Setsha se se na le kokoano ya difela tsa Bokatoliki tse di tserweng mo dibukeng tsa difela tse di ikanngwang. Re leboga ba ba dirileng tiro e tona ya go somarela dipina tse.",
    about_p3: "Maikemisetso a rona ke go dira gore difela tse di bonwe motlhofo ke batho — le fa ba le mo kerekeng, kwa gae, kgotsa ba le mo tseleng. Dipina tse ke karolo e tona ya tumelo ya rona le ngwao ya rona."
  },
  english: {
    nav_home: 'Home',
    nav_hymns: 'Hymns',
    nav_prayers: 'Prayers',
    nav_mass: 'Order of Mass',
    nav_about: 'About Us',
    tagline: 'Catholic Hymns',
    footer_verse: '"Sing to the Lord a new song" — Psalm 98:1',
    footer_source_hymns: 'Hymns sourced from',
    footer_source_church: 'Information from',
    holy_church: 'The Holy Church',
    home_title: 'A New Song',
    home_subtitle: 'Welcome to the online directory of hymns and common prayers of the Catholic Church.',
    home_btn_hymns: 'Open Hymns',
    home_btn_mass: 'Order of Mass',
    home_btn_prayers: 'Open Prayers',
    home_mission_title: "Preserving the Tradition of Faith",
    home_mission_text: "We preserve and share the hymns of the Catholic Church. These songs are a profound part of our faith and heritage. Our name, 'The Good Shepherd', reminds us that Jesus guides us, and we praise Him through song.",
    home_mission_btn: "Read More",
    home_news_title: "Vatican News",
    home_news_subtitle: "Letters, messages, and latest events from the Pope and the Holy Church.",
    home_featured_label: "Hymn of the Day",
    home_featured_btn: "Read full hymn →",
    about_title: "About",
    about_p1: "The Good Shepherd is an online platform created to preserve and share the hymns of the Catholic Church. The name reminds us of Jesus, the Good Shepherd, who calls us to praise Him.",
    about_p2: "This site features a collection of Catholic hymns sourced from trusted hymnals. We thank those who have done the great work of preserving these songs.",
    about_p3: "Our goal is to make these hymns easily accessible to the people — whether in church, at home, or on the go. These songs are a large part of our faith and our culture."
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [uiLang, setUiLang] = useState(() => {
    return localStorage.getItem('globalUiLang') || 'sesotho';
  });

  useEffect(() => {
    localStorage.setItem('globalUiLang', uiLang);
  }, [uiLang]);

  const t = (key) => {
    return translations[uiLang]?.[key] || translations['sesotho'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ uiLang, setUiLang, t, availableLangs: Object.keys(translations) }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
