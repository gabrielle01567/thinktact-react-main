import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { savePatentApplication, updatePatentApplication, getPatentApplication, uploadPatentImage } from '../services/patentService.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isSupabaseAvailable } from '../services/supabaseClient.js';
import { generatePatentTitles } from '../services/titleGenerationService.js';

const PatentAudit = () => {
  // Comprehensive list of all countries
  const allCountries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
    'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
    'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
    'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
    'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
    'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
    'Haiti', 'Honduras', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast',
    'Jamaica', 'Japan', 'Jordan',
    'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
    'Oman',
    'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
    'Qatar',
    'Romania', 'Russia', 'Rwanda',
    'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
    'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen',
    'Zambia', 'Zimbabwe'
  ];
  const { id: applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Helper function to get residences for a citizenship
  const getResidencesForCitizenship = (citizenship) => {
    return citizenshipData[citizenship]?.residences || [];
  };

  // Address autocomplete functions
  const searchAddress = async (query, inventorIndex) => {
    if (!query || query.length < 3) {
      setAddressSuggestions(prev => ({ ...prev, [inventorIndex]: [] }));
      setShowAddressDropdown(prev => ({ ...prev, [inventorIndex]: false }));
      return;
    }

    setIsAddressLoading(prev => ({ ...prev, [inventorIndex]: true }));
    setShowAddressDropdown(prev => ({ ...prev, [inventorIndex]: true }));

    try {
      // Use OpenStreetMap Nominatim API for address search (free and no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=${getCountryCode(inventors[inventorIndex]?.citizenship)}`
      );
      
      if (!response.ok) {
        throw new Error('Address search failed');
      }

      const data = await response.json();
      
      // Format the suggestions
      const suggestions = data.map(item => ({
        id: item.place_id,
        display: formatAddress(item),
        full: item.display_name,
        lat: item.lat,
        lon: item.lon,
        address: item.address
      }));

      setAddressSuggestions(prev => ({ ...prev, [inventorIndex]: suggestions }));
    } catch (error) {
      console.error('Address search error:', error);
      setAddressSuggestions(prev => ({ ...prev, [inventorIndex]: [] }));
      
      // Show error message to user
      setShowAddressDropdown(prev => ({ ...prev, [inventorIndex]: true }));
    } finally {
      setIsAddressLoading(prev => ({ ...prev, [inventorIndex]: false }));
    }
  };

  const formatAddress = (item) => {
    const address = item.address;
    let formatted = '';
    
    if (address.house_number && address.road) {
      formatted += `${address.house_number} ${address.road}`;
    } else if (address.road) {
      formatted += address.road;
    }
    
    if (address.city || address.town || address.village) {
      if (formatted) formatted += ', ';
      formatted += address.city || address.town || address.village;
    }
    
    if (address.state) {
      if (formatted) formatted += ', ';
      formatted += address.state;
    }
    
    if (address.postcode) {
      if (formatted) formatted += ' ';
      formatted += address.postcode;
    }
    
    if (address.country) {
      if (formatted) formatted += ', ';
      formatted += address.country;
    }
    
    return formatted || item.display_name;
  };

  const getCountryCode = (citizenship) => {
    const countryCodes = {
      'United States': 'us',
      'Canada': 'ca',
      'United Kingdom': 'gb',
      'Germany': 'de',
      'France': 'fr',
      'Japan': 'jp',
      'Australia': 'au',
      'China': 'cn',
      'India': 'in',
      'Brazil': 'br',
      'Mexico': 'mx',
      'South Korea': 'kr',
      'Italy': 'it',
      'Spain': 'es',
      'Netherlands': 'nl',
      'Switzerland': 'ch',
      'Sweden': 'se',
      'Norway': 'no',
      'Denmark': 'dk',
      'Finland': 'fi',
      'Ireland': 'ie',
      'Belgium': 'be',
      'Austria': 'at',
      'Poland': 'pl',
      'Czech Republic': 'cz',
      'Hungary': 'hu',
      'Greece': 'gr',
      'Portugal': 'pt',
      'New Zealand': 'nz',
      'Singapore': 'sg',
      'Israel': 'il',
      'United Arab Emirates': 'ae',
      'Saudi Arabia': 'sa',
      'Turkey': 'tr',
      'Iran': 'ir',
      'Egypt': 'eg',
      'South Africa': 'za',
      'Nigeria': 'ng',
      'Kenya': 'ke',
      'Ethiopia': 'et',
      'Morocco': 'ma',
      'Algeria': 'dz',
      'Tunisia': 'tn',
      'Libya': 'ly',
      'Sudan': 'sd',
      'Chad': 'td',
      'Niger': 'ne',
      'Mali': 'ml',
      'Burkina Faso': 'bf',
      'Senegal': 'sn',
      'Guinea': 'gn',
      'Sierra Leone': 'sl',
      'Liberia': 'lr',
      'Ivory Coast': 'ci',
      'Ghana': 'gh',
      'Togo': 'tg',
      'Benin': 'bj',
      'Cameroon': 'cm',
      'Central African Republic': 'cf',
      'Equatorial Guinea': 'gq',
      'Gabon': 'ga',
      'Republic of the Congo': 'cg',
      'Democratic Republic of the Congo': 'cd',
      'Angola': 'ao',
      'Zambia': 'zm',
      'Zimbabwe': 'zw',
      'Botswana': 'bw',
      'Namibia': 'na',
      'Lesotho': 'ls',
      'Eswatini': 'sz',
      'Madagascar': 'mg',
      'Mauritius': 'mu',
      'Seychelles': 'sc',
      'Comoros': 'km',
      'Djibouti': 'dj',
      'Eritrea': 'er',
      'Somalia': 'so'
    };
    
    return countryCodes[citizenship] || '';
  };

  const selectAddress = (inventorIndex, suggestion) => {
    const newInventors = [...inventors];
    newInventors[inventorIndex].address = suggestion.display;
    setInventors(newInventors);
    setShowAddressDropdown(prev => ({ ...prev, [inventorIndex]: false }));
  };

  const handleAddressInput = (inventorIndex, value) => {
    const newInventors = [...inventors];
    newInventors[inventorIndex].address = value;
    setInventors(newInventors);
    
    // Debounce the search
    clearTimeout(addressSearchTimeout.current);
    addressSearchTimeout.current = setTimeout(() => {
      searchAddress(value, inventorIndex);
    }, 300);
  };

  const handleAddressKeyDown = (inventorIndex, event) => {
    const suggestions = addressSuggestions[inventorIndex] || [];
    const currentIndex = parseInt(event.target.getAttribute('data-selected-index') || '-1');
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
        event.target.setAttribute('data-selected-index', nextIndex.toString());
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
        event.target.setAttribute('data-selected-index', prevIndex.toString());
        break;
      case 'Enter':
        event.preventDefault();
        if (currentIndex >= 0 && suggestions[currentIndex]) {
          selectAddress(inventorIndex, suggestions[currentIndex]);
        }
        break;
      case 'Escape':
        setShowAddressDropdown(prev => ({ ...prev, [inventorIndex]: false }));
        break;
    }
  };

  // Ref for debouncing address search
  const addressSearchTimeout = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (addressSearchTimeout.current) {
        clearTimeout(addressSearchTimeout.current);
      }
    };
  }, []);

  // Citizenship and Residence Data
  const citizenshipData = {
    'United States': {
      type: 'country',
      residences: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 
        'Wisconsin', 'Wyoming', 'District of Columbia', 'Puerto Rico', 'U.S. Virgin Islands', 
        'Guam', 'American Samoa', 'Northern Mariana Islands'
      ]
    },
    'Canada': {
      type: 'country',
      residences: [
        'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 
        'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 
        'Quebec', 'Saskatchewan', 'Yukon'
      ]
    },
    'United Kingdom': {
      type: 'country',
      residences: [
        'England', 'Scotland', 'Wales', 'Northern Ireland', 'Channel Islands', 'Isle of Man'
      ]
    },
    'Germany': {
      type: 'country',
      residences: [
        'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 
        'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 
        'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
      ]
    },
    'France': {
      type: 'country',
      residences: [
        'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire', 
        'Corse', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandie', 'Nouvelle-Aquitaine', 
        'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
      ]
    },
    'Japan': {
      type: 'country',
      residences: [
        'Hokkaido', 'Tohoku', 'Kanto', 'Chubu', 'Kansai', 'Chugoku', 'Shikoku', 'Kyushu', 'Okinawa'
      ]
    },
    'Australia': {
      type: 'country',
      residences: [
        'New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 
        'Tasmania', 'Australian Capital Territory', 'Northern Territory'
      ]
    },
    'China': {
      type: 'country',
      residences: [
        'Beijing', 'Tianjin', 'Hebei', 'Shanxi', 'Inner Mongolia', 'Liaoning', 'Jilin', 
        'Heilongjiang', 'Shanghai', 'Jiangsu', 'Zhejiang', 'Anhui', 'Fujian', 'Jiangxi', 
        'Shandong', 'Henan', 'Hubei', 'Hunan', 'Guangdong', 'Guangxi', 'Hainan', 'Chongqing', 
        'Sichuan', 'Guizhou', 'Yunnan', 'Tibet', 'Shaanxi', 'Gansu', 'Qinghai', 'Ningxia', 'Xinjiang'
      ]
    },
    'India': {
      type: 'country',
      residences: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
        'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
        'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
        'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 
        'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 
        'Puducherry', 'Andaman and Nicobar Islands'
      ]
    },
    'Brazil': {
      type: 'country',
      residences: [
        'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 
        'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 
        'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 
        'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 
        'São Paulo', 'Sergipe', 'Tocantins'
      ]
    },
    'Mexico': {
      type: 'country',
      residences: [
        'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 
        'Chihuahua', 'Coahuila', 'Colima', 'Ciudad de México', 'Durango', 'Guanajuato', 
        'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 
        'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 
        'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
      ]
    },
    'South Korea': {
      type: 'country',
      residences: [
        'Seoul', 'Busan', 'Daegu', 'Incheon', 'Gwangju', 'Daejeon', 'Ulsan', 'Sejong', 
        'Gyeonggi', 'Gangwon', 'North Chungcheong', 'South Chungcheong', 'North Jeolla', 
        'South Jeolla', 'North Gyeongsang', 'South Gyeongsang', 'Jeju'
      ]
    },
    'Italy': {
      type: 'country',
      residences: [
        'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 
        'Lazio', 'Liguria', 'Lombardia', 'Marche', 'Molise', 'Piemonte', 'Puglia', 'Sardegna', 
        'Sicilia', 'Toscana', 'Trentino-Alto Adige', 'Umbria', 'Valle d\'Aosta', 'Veneto'
      ]
    },
    'Spain': {
      type: 'country',
      residences: [
        'Andalucía', 'Aragón', 'Asturias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 
        'Cataluña', 'Comunidad Valenciana', 'Extremadura', 'Galicia', 'Islas Baleares', 
        'Islas Canarias', 'La Rioja', 'Madrid', 'Murcia', 'Navarra', 'País Vasco', 'Ceuta', 'Melilla'
      ]
    },
    'Netherlands': {
      type: 'country',
      residences: [
        'Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 
        'Noord-Brabant', 'Noord-Holland', 'Overijssel', 'Utrecht', 'Zeeland', 'Zuid-Holland'
      ]
    },
    'Switzerland': {
      type: 'country',
      residences: [
        'Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft', 
        'Basel-Stadt', 'Bern', 'Fribourg', 'Genève', 'Glarus', 'Graubünden', 'Jura', 
        'Luzern', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Sankt Gallen', 'Schaffhausen', 
        'Schwyz', 'Solothurn', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zürich'
      ]
    },
    'Sweden': {
      type: 'country',
      residences: [
        'Blekinge', 'Dalarna', 'Gotland', 'Gävleborg', 'Halland', 'Jämtland', 'Jönköping', 
        'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 
        'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland'
      ]
    },
    'Norway': {
      type: 'country',
      residences: [
        'Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 
        'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Viken'
      ]
    },
    'Denmark': {
      type: 'country',
      residences: [
        'Capital Region', 'Central Jutland', 'North Jutland', 'Region Zealand', 'Southern Denmark'
      ]
    },
    'Finland': {
      type: 'country',
      residences: [
        'Åland Islands', 'Central Finland', 'Central Ostrobothnia', 'Kainuu', 'Kymenlaakso', 
        'Lapland', 'North Karelia', 'Northern Ostrobothnia', 'Northern Savonia', 'Ostrobothnia', 
        'Päijänne Tavastia', 'Pirkanmaa', 'Satakunta', 'South Karelia', 'Southern Ostrobothnia', 
        'Southern Savonia', 'Southwest Finland', 'Tavastia Proper', 'Uusimaa'
      ]
    },
    'Ireland': {
      type: 'country',
      residences: [
        'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 
        'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 
        'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
      ]
    },
    'Belgium': {
      type: 'country',
      residences: [
        'Antwerp', 'East Flanders', 'Flemish Brabant', 'Hainaut', 'Liège', 'Limburg', 
        'Luxembourg', 'Namur', 'Walloon Brabant', 'West Flanders'
      ]
    },
    'Austria': {
      type: 'country',
      residences: [
        'Burgenland', 'Carinthia', 'Lower Austria', 'Salzburg', 'Styria', 'Tyrol', 
        'Upper Austria', 'Vienna', 'Vorarlberg'
      ]
    },
    'Poland': {
      type: 'country',
      residences: [
        'Greater Poland', 'Kuyavian-Pomeranian', 'Lesser Poland', 'Łódź', 'Lower Silesian', 
        'Lublin', 'Lubusz', 'Masovian', 'Opole', 'Podkarpackie', 'Podlaskie', 'Pomeranian', 
        'Silesian', 'Świętokrzyskie', 'Warmian-Masurian', 'West Pomeranian'
      ]
    },
    'Czech Republic': {
      type: 'country',
      residences: [
        'Central Bohemian', 'Hradec Králové', 'Karlovy Vary', 'Liberec', 'Moravian-Silesian', 
        'Olomouc', 'Pardubice', 'Pilsen', 'Prague', 'South Bohemian', 'South Moravian', 'Ústí nad Labem', 'Vysočina', 'Zlín'
      ]
    },
    'Hungary': {
      type: 'country',
      residences: [
        'Bács-Kiskun', 'Baranya', 'Békés', 'Borsod-Abaúj-Zemplén', 'Csongrád', 'Fejér', 
        'Győr-Moson-Sopron', 'Hajdú-Bihar', 'Heves', 'Jász-Nagykun-Szolnok', 'Komárom-Esztergom', 
        'Nógrád', 'Pest', 'Somogy', 'Szabolcs-Szatmár-Bereg', 'Tolna', 'Vas', 'Veszprém', 'Zala'
      ]
    },
    'Greece': {
      type: 'country',
      residences: [
        'Attica', 'Central Greece', 'Central Macedonia', 'Crete', 'East Macedonia and Thrace', 
        'Epirus', 'Ionian Islands', 'North Aegean', 'Peloponnese', 'South Aegean', 'Thessaly', 'West Greece', 'West Macedonia'
      ]
    },
    'Portugal': {
      type: 'country',
      residences: [
        'Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 
        'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Azores', 'Madeira'
      ]
    },
    'New Zealand': {
      type: 'country',
      residences: [
        'Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay', 'Manawatu-Wanganui', 
        'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'Westland'
      ]
    },
    'Singapore': {
      type: 'country',
      residences: [
        'Central Region', 'East Region', 'North Region', 'North-East Region', 'West Region'
      ]
    },
    'Israel': {
      type: 'country',
      residences: [
        'Central District', 'Haifa District', 'Jerusalem District', 'Northern District', 
        'Southern District', 'Tel Aviv District'
      ]
    },
    'United Arab Emirates': {
      type: 'country',
      residences: [
        'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'
      ]
    },
    'Saudi Arabia': {
      type: 'country',
      residences: [
        'Al Bahah', 'Al Hudud ash Shamaliyah', 'Al Jawf', 'Al Madinah', 'Al Qasim', 'Ar Riyad', 
        'Ash Sharqiyah', 'Asir', 'Ha\'il', 'Jazan', 'Makkah', 'Najran', 'Tabuk'
      ]
    },
    'Turkey': {
      type: 'country',
      residences: [
        'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin', 
        'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 
        'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 
        'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 
        'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli', 
        'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir', 
        'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 
        'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 
        'Karaman', 'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 
        'Kilis', 'Osmaniye', 'Düzce'
      ]
    },
    'Iran': {
      type: 'country',
      residences: [
        'Alborz', 'Ardabil', 'Bushehr', 'Chaharmahal and Bakhtiari', 'East Azerbaijan', 
        'Fars', 'Gilan', 'Golestan', 'Hamadan', 'Hormozgan', 'Ilam', 'Isfahan', 'Kerman', 
        'Kermanshah', 'Khorasan, North', 'Khorasan, Razavi', 'Khorasan, South', 'Kohgiluyeh and Boyer-Ahmad', 
        'Kurdistan', 'Lorestan', 'Markazi', 'Mazandaran', 'Qazvin', 'Qom', 'Semnan', 'Sistan and Baluchestan', 
        'Tehran', 'West Azerbaijan', 'Yazd', 'Zanjan'
      ]
    },
    'Egypt': {
      type: 'country',
      residences: [
        'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 
        'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matruh', 'Minya', 
        'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 
        'Sharqia', 'Sohag', 'South Sinai', 'Suez'
      ]
    },
    'South Africa': {
      type: 'country',
      residences: [
        'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 
        'Northern Cape', 'North West', 'Western Cape'
      ]
    },
    'Nigeria': {
      type: 'country',
      residences: [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 
        'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 
        'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 
        'Taraba', 'Yobe', 'Zamfara'
      ]
    },
    'Kenya': {
      type: 'country',
      residences: [
        'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay', 
        'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 
        'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 
        'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi', 
        'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 
        'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
      ]
    },
    'Ethiopia': {
      type: 'country',
      residences: [
        'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 
        'Oromia', 'Somali', 'Southern Nations, Nationalities, and Peoples', 'Tigray'
      ]
    },
    'Morocco': {
      type: 'country',
      residences: [
        'Béni Mellal-Khénifra', 'Casablanca-Settat', 'Dakhla-Oued Ed-Dahab', 'Drâa-Tafilalet', 
        'Fès-Meknès', 'Guelmim-Oued Noun', 'Laâyoune-Sakia El Hamra', 'Marrakech-Safi', 
        'Oriental', 'Rabat-Salé-Kénitra', 'Souss-Massa', 'Tanger-Tétouan-Al Hoceïma'
      ]
    },
    'Algeria': {
      type: 'country',
      residences: [
        'Adrar', 'Aïn Defla', 'Aïn Témouchent', 'Algiers', 'Annaba', 'Batna', 'Béchar', 'Béjaïa', 
        'Biskra', 'Blida', 'Bordj Bou Arréridj', 'Bouira', 'Boumerdès', 'Chlef', 'Constantine', 
        'Djelfa', 'El Bayadh', 'El Oued', 'El Tarf', 'Ghardaïa', 'Guelma', 'Illizi', 'Jijel', 
        'Khenchela', 'Laghouat', 'Mascara', 'Médéa', 'Mila', 'Mostaganem', 'M\'Sila', 'Naâma', 
        'Oran', 'Ouargla', 'Oum El Bouaghi', 'Relizane', 'Saïda', 'Sétif', 'Sidi Bel Abbès', 
        'Skikda', 'Souk Ahras', 'Tamanghasset', 'Tébessa', 'Tiaret', 'Tindouf', 'Tipaza', 
        'Tissemsilt', 'Tizi Ouzou', 'Tlemcen'
      ]
    },
    'Tunisia': {
      type: 'country',
      residences: [
        'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 'Kairouan', 
        'Kasserine', 'Kébili', 'Kef', 'Mahdia', 'Manouba', 'Médenine', 'Monastir', 'Nabeul', 
        'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
      ]
    },
    'Libya': {
      type: 'country',
      residences: [
        'Al Butnan', 'Al Jabal al Akhdar', 'Al Jabal al Gharbi', 'Al Jafarah', 'Al Jufrah', 
        'Al Kufrah', 'Al Marj', 'Al Marqab', 'Al Wahat', 'An Nuqat al Khams', 'Az Zawiyah', 
        'Benghazi', 'Darnah', 'Ghat', 'Misratah', 'Murzuq', 'Sabha', 'Surt', 'Tarabulus', 'Wadi al Hayat', 'Wadi ash Shati\''
      ]
    },
    'Sudan': {
      type: 'country',
      residences: [
        'Al Jazirah', 'Al Qadarif', 'Blue Nile', 'Central Darfur', 'East Darfur', 'Gedaref', 
        'Gezerira', 'Kassala', 'Khartoum', 'North Darfur', 'North Kordofan', 'Northern', 'Red Sea', 
        'River Nile', 'Sennar', 'South Darfur', 'South Kordofan', 'West Darfur', 'West Kordofan', 'White Nile'
      ]
    },
    'Chad': {
      type: 'country',
      residences: [
        'Bahr el Gazel', 'Batha', 'Borkou', 'Chari-Baguirmi', 'Ennedi-Est', 'Ennedi-Ouest', 
        'Guéra', 'Hadjer-Lamis', 'Kanem', 'Lac', 'Logone Occidental', 'Logone Oriental', 
        'Mandoul', 'Mayo-Kebbi Est', 'Mayo-Kebbi Ouest', 'Moyen-Chari', 'Ouaddaï', 'Salamat', 
        'Sila', 'Tandjilé', 'Tibesti', 'Ville de N\'Djamena', 'Wadi Fira'
      ]
    },
    'Niger': {
      type: 'country',
      residences: [
        'Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillabéri', 'Zinder'
      ]
    },
    'Mali': {
      type: 'country',
      residences: [
        'Bamako', 'Gao', 'Kayes', 'Kidal', 'Koulikoro', 'Mopti', 'Ségou', 'Sikasso', 'Tombouctou'
      ]
    },
    'Burkina Faso': {
      type: 'country',
      residences: [
        'Boucle du Mouhoun', 'Cascades', 'Centre', 'Centre-Est', 'Centre-Nord', 'Centre-Ouest', 
        'Centre-Sud', 'Est', 'Hauts-Bassins', 'Nord', 'Plateau-Central', 'Sahel', 'Sud-Ouest'
      ]
    },
    'Senegal': {
      type: 'country',
      residences: [
        'Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 
        'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Thiès', 'Ziguinchor'
      ]
    },
    'Guinea': {
      type: 'country',
      residences: [
        'Boké', 'Conakry', 'Faranah', 'Kankan', 'Kindia', 'Labé', 'Mamou', 'Nzérékoré'
      ]
    },
    'Sierra Leone': {
      type: 'country',
      residences: [
        'Eastern', 'Northern', 'Southern', 'Western Area'
      ]
    },
    'Liberia': {
      type: 'country',
      residences: [
        'Bomi', 'Bong', 'Gbarpolu', 'Grand Bassa', 'Grand Cape Mount', 'Grand Gedeh', 
        'Grand Kru', 'Lofa', 'Margibi', 'Maryland', 'Montserrado', 'Nimba', 'River Cess', 'River Gee', 'Sinoe'
      ]
    },
    'Ivory Coast': {
      type: 'country',
      residences: [
        'Abidjan', 'Bas-Sassandra', 'Comoé', 'Denguélé', 'Gôh-Djiboua', 'Lacs', 'Lagunes', 
        'Montagnes', 'Sassandra-Marahoué', 'Savanes', 'Vallée du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan'
      ]
    },
    'Ghana': {
      type: 'country',
      residences: [
        'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 
        'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
      ]
    },
    'Togo': {
      type: 'country',
      residences: [
        'Centrale', 'Kara', 'Maritime', 'Plateaux', 'Savanes'
      ]
    },
    'Benin': {
      type: 'country',
      residences: [
        'Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou'
      ]
    },
    'Cameroon': {
      type: 'country',
      residences: [
        'Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'North-West', 'South', 'South-West', 'West'
      ]
    },
    'Central African Republic': {
      type: 'country',
      residences: [
        'Bamingui-Bangoran', 'Bangui', 'Basse-Kotto', 'Haute-Kotto', 'Haut-Mbomou', 'Kémo', 
        'Lobaye', 'Mambéré-Kadéï', 'Mbomou', 'Nana-Grébizi', 'Nana-Mambéré', 'Ombella-M\'Poko', 
        'Ouaka', 'Ouham', 'Ouham-Pendé', 'Sangha-Mbaéré', 'Vakaga'
      ]
    },
    'Equatorial Guinea': {
      type: 'country',
      residences: [
        'Annobón', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 'Kié-Ntem', 'Litoral', 'Wele-Nzas'
      ]
    },
    'Gabon': {
      type: 'country',
      residences: [
        'Estuaire', 'Haut-Ogooué', 'Moyen-Ogooué', 'Ngounié', 'Nyanga', 'Ogooué-Ivindo', 'Ogooué-Lolo', 'Ogooué-Maritime', 'Woleu-Ntem'
      ]
    },
    'Republic of the Congo': {
      type: 'country',
      residences: [
        'Bouenza', 'Brazzaville', 'Cuvette', 'Cuvette-Ouest', 'Kouilou', 'Lékoumou', 'Likouala', 'Niari', 'Plateaux', 'Pointe-Noire', 'Pool', 'Sangha'
      ]
    },
    'Democratic Republic of the Congo': {
      type: 'country',
      residences: [
        'Bas-Uélé', 'Équateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uélé', 'Ituri', 'Kasaï', 
        'Kasaï-Central', 'Kasaï-Oriental', 'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 
        'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 
        'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'
      ]
    },
    'Angola': {
      type: 'country',
      residences: [
        'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 
        'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
      ]
    },
    'Zambia': {
      type: 'country',
      residences: [
        'Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western'
      ]
    },
    'Zimbabwe': {
      type: 'country',
      residences: [
        'Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 
        'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'
      ]
    },
    'Botswana': {
      type: 'country',
      residences: [
        'Central', 'Chobe', 'Francistown', 'Gaborone', 'Ghanzi', 'Jwaneng', 'Kgalagadi', 
        'Kgatleng', 'Kweneng', 'Lobatse', 'North East', 'North West', 'Selibe Phikwe', 'South East', 'Southern'
      ]
    },
    'Namibia': {
      type: 'country',
      residences: [
        'Erongo', 'Hardap', 'Karas', 'Kavango East', 'Kavango West', 'Khomas', 'Kunene', 
        'Ohangwena', 'Omaheke', 'Omusati', 'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'
      ]
    },
    'Lesotho': {
      type: 'country',
      residences: [
        'Berea', 'Butha-Buthe', 'Leribe', 'Mafeteng', 'Maseru', 'Mohale\'s Hoek', 'Mokhotlong', 'Qacha\'s Nek', 'Quthing', 'Thaba-Tseka'
      ]
    },
    'Eswatini': {
      type: 'country',
      residences: [
        'Hhohho', 'Lubombo', 'Manzini', 'Shiselweni'
      ]
    },
    'Madagascar': {
      type: 'country',
      residences: [
        'Alaotra-Mangoro', 'Amoron\'i Mania', 'Analamanga', 'Analanjirofo', 'Androy', 'Anosy', 
        'Atsimo-Andrefana', 'Atsimo-Atsinanana', 'Atsinanana', 'Betsiboka', 'Boeny', 'Bongolava', 
        'Diana', 'Haute Matsiatra', 'Ihorombe', 'Itasy', 'Melaky', 'Menabe', 'Sava', 'Sofia', 'Vakinankaratra', 'Vatovavy-Fitovinany'
      ]
    },
    'Mauritius': {
      type: 'country',
      residences: [
        'Agalega Islands', 'Black River', 'Cargados Carajos', 'Flacq', 'Grand Port', 'Moka', 'Pamplemousses', 'Plaines Wilhems', 'Port Louis', 'Rivière du Rempart', 'Rodrigues Island', 'Savanne'
      ]
    },
    'Seychelles': {
      type: 'country',
      residences: [
        'Anse aux Pins', 'Anse Boileau', 'Anse Etoile', 'Anse Royale', 'Anse Volbert', 'Au Cap', 'Baie Lazare', 'Baie Sainte Anne', 'Beau Vallon', 'Bel Air', 'Bel Ombre', 'Cascade', 'Glacis', 'Grand Anse Mahe', 'Grand Anse Praslin', 'La Digue', 'La Riviere Anglaise', 'Les Mamelles', 'Mont Buxton', 'Mont Fleuri', 'Plaisance', 'Pointe La Rue', 'Port Glaud', 'Roche Caiman', 'Saint Louis', 'Takamaka'
      ]
    },
    'Comoros': {
      type: 'country',
      residences: [
        'Anjouan', 'Grande Comore', 'Mohéli'
      ]
    },
    'Djibouti': {
      type: 'country',
      residences: [
        'Ali Sabieh', 'Arta', 'Dikhil', 'Djibouti', 'Obock', 'Tadjourah'
      ]
    },
    'Eritrea': {
      type: 'country',
      residences: [
        'Anseba', 'Debub', 'Debubawi K\'eyih Bahri', 'Gash-Barka', 'Ma\'akel', 'Semenawi K\'eyih Bahri'
      ]
    },
    'Somalia': {
      type: 'country',
      residences: [
        'Awdal', 'Bakool', 'Banaadir', 'Bari', 'Bay', 'Galguduud', 'Gedo', 'Hiran', 'Jubbada Dhexe', 'Jubbada Hoose', 'Mudug', 'Nugaal', 'Sanaag', 'Shabeellaha Dhexe', 'Shabeellaha Hoose', 'Sool', 'Togdheer', 'Woqooyi Galbeed'
      ]
    },
    'Other': {
      type: 'other',
      residences: ['Other']
    }
  };
  
  // Debug logging for applicationId
  useEffect(() => {
    console.log('🔍 ApplicationId Debug:', {
      applicationId,
      hasApplicationId: !!applicationId,
      currentPath: window.location.pathname,
      expectedPath: applicationId ? `/patent-buddy/wizard/${applicationId}` : '/patent-buddy/wizard'
    });
  }, [applicationId]);
  
  // 1. Replace currentSection with currentStep (index-based navigation)
  const [currentStep, setCurrentStep] = useState(0);

  // 3. Build wizardSteps array - both sections are now required
  const getWizardSteps = () => {
    const steps = [
      { key: 'Introduction' },
      { key: 'Title' },
      { key: 'CrossReference' },
      { key: 'FederalResearch' },
      { key: 'Inventors' },
      { key: 'Abstract' },
      { key: 'Field' },
      { key: 'Background' },
      { key: 'Summary' },
      { key: 'Drawings' },
      { key: 'DetailedDescription' },
      { key: 'Review' }
    ];
    
    return steps;
  };
  


  // 4. Render only the current step
  const renderCurrentStep = () => {
    try {
      const currentStepData = getWizardSteps()[currentStep];
      
      if (!currentStepData) {
        console.log('🔍 No current step data found for step:', currentStep);
        return <div>Loading...</div>;
      }
      
      console.log('🔍 Rendering step:', currentStepData.key, 'at index:', currentStep);
      
      // Use renderSectionContent for all sections to ensure consistent implementation
      return renderSectionContent(currentStepData.key);
    } catch (error) {
      console.error('🔍 Error rendering current step:', error);
      return <div>Error rendering step. Please refresh the page.</div>;
    }
  };

  // 5. Validation function for required fields
  const validateCurrentStep = () => {
    const currentStepData = getWizardSteps()[currentStep];
    
    switch (currentStepData.key) {
      case 'Introduction':
        return true; // Introduction doesn't require validation
      case 'Title':
        return title.trim() !== '';
      case 'Inventors':
        return inventors.some(inv => inv.name.trim() !== '' && inv.address.trim() !== '');
      case 'Abstract':
        return abstract.trim() !== '';
      case 'Field':
        return field.trim() !== '';
      case 'Background':
        return background.trim() !== '';
      case 'Summary':
        return summary.trim() !== '';
      case 'Drawings':
        return drawings.trim() !== '';
      case 'DetailedDescription':
        return detailedDescription.trim() !== '';
      case 'CrossReference':
        return hasCrossReference !== null && (hasCrossReference ? crossReference.trim() !== '' : true);
      case 'FederalResearch':
        return hasFederalSponsorship !== null && (hasFederalSponsorship ? federalResearch.trim() !== '' : true);
      default:
        return true; // Gate questions and other non-required sections
    }
  };

  // 6. Next/Back button logic with validation
  const goToNextStep = () => {
    if (currentStep < getWizardSteps().length - 1) {
      // Check if current step has required fields that are incomplete
      if (!validateCurrentStep()) {
        // Mark current step as needing review
        markForReview(getWizardSteps()[currentStep].key);
        // Show a brief message to the user
        setSaveMessage('⚠️ This section has required fields that need to be completed. It has been marked for review.');
        setTimeout(() => setSaveMessage(''), 3000); // Clear message after 3 seconds
      } else {
        // Clear review mark if step is now complete
        clearReviewMark(getWizardSteps()[currentStep].key);
      }
      setCurrentStep(currentStep + 1);
    }
  };
  const goToPrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // 6. Progress indicator
  const renderProgress = () => (
    <div className="w-full flex justify-center items-center mb-6">
      <span className="text-gray-700 font-medium">Step {currentStep + 1} of {getWizardSteps().length}</span>
    </div>
  );

  // 7. Helper function to render required field indicator
  const renderRequiredIndicator = () => (
    <span className="text-red-500 ml-1">*</span>
  );



  // Add missing render functions for each section
  function renderIntroductionSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Patent Buddy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your AI-powered assistant for creating comprehensive patent applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                What You Can Expect
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Step-by-step guidance through each section of your patent application</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>AI-powered suggestions and templates to help you write compelling content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Real-time document preview as you build your application</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Save your progress and return anytime to continue working</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Professional formatting that meets USPTO requirements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                How to Approach This Process
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">1.</span>
                  <span><strong>Take your time:</strong> Quality patent applications require careful thought and detail</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">2.</span>
                  <span><strong>Be thorough:</strong> Include all relevant technical details and background information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">3.</span>
                  <span><strong>Use the preview:</strong> Check how your application looks as you build it</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">4.</span>
                  <span><strong>Save regularly:</strong> Your progress is automatically saved as you work</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">5.</span>
                  <span><strong>Review carefully:</strong> The final review step helps ensure completeness</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Important Notes
          </h3>
          <div className="text-blue-800 space-y-2">
            <p><strong>This tool helps you create a draft patent application.</strong> While it provides comprehensive guidance and formatting, you should always have your final application reviewed by a qualified patent attorney or agent before filing with the USPTO.</p>
            <p>The application will be saved as a draft that you can edit, review, and finalize before submission to the patent office.</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={goToNextStep}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  function renderTitleSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Title of the Invention</h2>
        <p className="text-gray-600 mb-6">Provide a clear, concise title that accurately describes your invention. Avoid overly broad or vague titles.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title{renderRequiredIndicator()}
            </label>
            <input
              type="text"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g., "System and Method for AI-Powered Content Generation"'
            />
          </div>
          
          {/* Title Generation Help Section */}
          <div className="mt-3">
            <button
              onClick={() => setShowTitleGenerationPopup(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Help with Title Creation
            </button>
          </div>



          <div className="bg-blue-50 rounded-lg p-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium text-blue-900"
              onClick={() => setShowTips(!showTips)}
            >
              Tips for a Strong Title
              <span>{showTips ? '▲' : '▼'}</span>
            </button>
            {showTips && (
              <ul className="mt-2 space-y-2 text-sm text-blue-800">
                <li>• Be specific about the technology area</li>
                <li>• Include key technical features that make your invention unique</li>
                <li>• Avoid marketing language or superlatives</li>
                <li>• Keep it under 15 words if possible</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderCrossReferenceSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cross-Reference to Related Applications</h2>
        <p className="text-gray-600 mb-6">Provide the application number and filing date of the earlier application you are claiming priority to.</p>
        <textarea
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={crossReference}
          onChange={(e) => setCrossReference(e.target.value)}
          placeholder="e.g., This application claims the benefit of U.S. Provisional Application No. 62/123,456, filed Jan. 1, 2023."
        />
      </div>
    );
  }

  function renderFederalResearchSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Federally Sponsored Research or Development</h2>
        <p className="text-gray-600 mb-6">Provide the contract or grant number and the government agency that supported this invention.</p>
        <textarea
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={federalResearch}
          onChange={(e) => setFederalResearch(e.target.value)}
          placeholder="e.g., This invention was made with government support under contract no. ABC-123 awarded by the National Science Foundation. The government has certain rights in the invention."
        />
      </div>
    );
  }

  function renderInventorsSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventors{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution to the inventive concept.</p>
        
        <div className="space-y-6">
          {/* Display existing inventors */}
          {inventors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Added Inventors:</h3>
              {inventors.map((inventor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-medium text-gray-900">Inventor {index + 1}</h4>
                    <button
                      onClick={() => {
                        const newInventors = inventors.filter((_, i) => i !== index);
                        setInventors(newInventors);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>
                      <div className="text-gray-900">{inventor.name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Address:</span>
                      <div className="text-gray-900">{inventor.address}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Citizenship:</span>
                      <div className="text-gray-900">{inventor.citizenship}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Residence:</span>
                      <div className="text-gray-900">{inventor.residence}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Inventor Button */}
          <div className="text-center">
            <button
              onClick={handleOpenInventorPopup}
              className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Inventor
            </button>
            {inventors.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Click the button above to add the first inventor</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderAbstractSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">Provide a concise summary of your invention (150 words or less). This should explain what your invention does and its key benefits.</p>
        <textarea
          rows={6}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          placeholder="Describe your invention in a clear, concise manner..."
        />
      </div>
    );
  }

  function renderFieldSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Field of Invention{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">Describe the technical field to which your invention relates.</p>
        <textarea
          rows={4}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={field}
          onChange={(e) => setField(e.target.value)}
          placeholder="e.g., The present invention relates to artificial intelligence and machine learning systems, specifically to natural language processing and content generation."
        />
      </div>
    );
  }

  function renderBackgroundSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Background{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">Describe the current state of the art and the problems your invention solves.</p>
        <textarea
          rows={8}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="Describe the existing technology and the problems it has..."
        />
      </div>
    );
  }

  function renderSummarySection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">Provide a brief summary of your invention, including its main features and advantages.</p>
        <textarea
          rows={6}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Summarize your invention and its key features..."
        />
      </div>
    );
  }

  function renderDrawingsSection() {
    const handleFileSelect = (event) => {
      const files = Array.from(event.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Initialize names for new files
      const newNames = {};
      files.forEach(file => {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        newNames[file.name] = fileName;
      });
      setImageNames(prev => ({ ...prev, ...newNames }));
    };

    const handleUpload = async () => {
      if (selectedFiles.length === 0) return;
      
      setUploading(true);
      setUploadError('');
      
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          // Create a new file with the custom name if provided
          let fileToUpload = file;
          if (imageNames[file.name]) {
            const customName = imageNames[file.name];
            const extension = file.name.split('.').pop();
            const newFileName = `${customName}.${extension}`;
            
            // Create a new File object with the custom name
            fileToUpload = new File([file], newFileName, {
              type: file.type,
              lastModified: file.lastModified,
            });
          }
          
          const response = await uploadPatentImage(fileToUpload, user.id, applicationId || 'draft');
          return response;
        });
        
        const uploadedImages = await Promise.all(uploadPromises);
        setImages(prev => [...prev, ...uploadedImages]);
        setSelectedFiles([]);
        setImageNames({});
        
      } catch (error) {
        console.error('Error uploading images:', error);
        setUploadError('Failed to upload images. Please try again.');
      } finally {
        setUploading(false);
      }
    };

    const removeImage = (imageToRemove) => {
      setImages(prev => prev.filter(img => img !== imageToRemove));
    };

    const openImageModal = (image) => {
      setSelectedImage(image);
      setShowImageModal(true);
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Drawings and Images{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">Upload drawings and images that accompany your patent application. You can provide custom names for each image.</p>
        
        {/* Text Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Brief Description of Drawings</label>
          <textarea
            rows={4}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={drawings}
            onChange={(e) => setDrawings(e.target.value)}
            placeholder="e.g., FIG. 1 is a block diagram showing the overall system architecture..."
          />
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
            <div className="space-y-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Custom Name</label>
                    <input
                      type="text"
                      value={imageNames[file.name] || ''}
                      onChange={(e) => setImageNames(prev => ({ ...prev, [file.name]: e.target.value }))}
                      placeholder="e.g., Figure 1 - System Architecture"
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                      setImageNames(prev => {
                        const newNames = { ...prev };
                        delete newNames[file.name];
                        return newNames;
                      });
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            
            {/* Upload Button */}
            <div className="mt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                  uploading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Upload Images'}
              </button>
              {uploadError && (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              )}
            </div>
          </div>
        )}

        {/* Uploaded Images */}
        {images.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={image.name || `Image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => openImageModal(image)}
                    title="Click to enlarge"
                  />
                  {/* Click indicator */}
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  {/* Delete button - positioned in top-left corner */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image);
                      }}
                      className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                      title="Delete image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-600 truncate">
                    {image.name || `Image ${index + 1}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setShowImageModal(false)}
          >
            <div className="max-w-6xl max-h-full p-4 relative">
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(false);
                  }}
                  className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-200 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Zoom indicator */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-10">
                  Click outside to close • ESC to close
                </div>

                {/* Main image */}
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name || 'Selected image'}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Image info */}
                <div className="mt-4 text-center text-white">
                  <p className="font-medium text-lg">{selectedImage.name || 'Untitled Image'}</p>
                  {selectedImage.size && (
                    <p className="text-sm text-gray-300 mt-1">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    );
  }

  function renderDetailedDescriptionSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Description{renderRequiredIndicator()}</h2>
        <p className="text-gray-600 mb-6">Provide a detailed description of your invention, including how it works and how to make and use it.</p>
        <textarea
          rows={12}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={detailedDescription}
          onChange={(e) => setDetailedDescription(e.target.value)}
          placeholder="Provide a detailed description of your invention..."
        />
      </div>
    );
  }

  function renderReviewSection() {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Application</h2>
        <p className="text-gray-600 mb-6">Review all sections of your patent application before saving.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Title</span>
            <span className={title.trim() ? 'text-green-600' : 'text-red-600'}>
              {title.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Inventors</span>
            <span className={inventors.some(inv => inv.name.trim() && inv.address.trim()) ? 'text-green-600' : 'text-red-600'}>
              {inventors.some(inv => inv.name.trim() && inv.address.trim()) ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Abstract</span>
            <span className={abstract.trim() ? 'text-green-600' : 'text-red-600'}>
              {abstract.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Field</span>
            <span className={field.trim() ? 'text-green-600' : 'text-red-600'}>
              {field.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Background</span>
            <span className={background.trim() ? 'text-green-600' : 'text-red-600'}>
              {background.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Summary</span>
            <span className={summary.trim() ? 'text-green-600' : 'text-red-600'}>
              {summary.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Drawings</span>
            <span className={drawings.trim() ? 'text-green-600' : 'text-red-600'}>
              {drawings.trim() ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="font-medium">Detailed Description</span>
            <span className={detailedDescription.trim() ? 'text-green-600' : 'text-red-600'}>
              {detailedDescription.trim() ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const [title, setTitle] = useState('');
  const [showTips, setShowTips] = useState(true);
  
  // Title generation states
  const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
  const [generatedTitles, setGeneratedTitles] = useState([]);
  const [showTitleGenerationPopup, setShowTitleGenerationPopup] = useState(false);
  const [titleGenerationError, setTitleGenerationError] = useState('');
  const [titleValidation, setTitleValidation] = useState({ isValid: true, issues: [] });
  const [titleGenerationInput, setTitleGenerationInput] = useState('');
  
  // Premium feature popup state
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [showCommonMistakes, setShowCommonMistakes] = useState(true);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('uspto'); // 'uspto' format only
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [showHelpPanel, setShowHelpPanel] = useState(true);
  
  // Address autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState({});
  const [showAddressDropdown, setShowAddressDropdown] = useState({});
  const [isAddressLoading, setIsAddressLoading] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // New state for other sections
  const [abstract, setAbstract] = useState('');
  const [field, setField] = useState('');
  const [background, setBackground] = useState('');
  const [summary, setSummary] = useState('');
  const [drawings, setDrawings] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');

  // Add state for new optional sections
  const [crossReference, setCrossReference] = useState('');
  const [federalResearch, setFederalResearch] = useState('');
  
  // Add state for inventors
  const [inventors, setInventors] = useState([]);
  
  // Inventor popup states
  const [showInventorPopup, setShowInventorPopup] = useState(false);
  const [inventorPopupStep, setInventorPopupStep] = useState(1); // 1: name, 2: address, 3: citizenship, 4: residence
  const [newInventor, setNewInventor] = useState({
    name: '',
    address: '',
    addressCont: '',
    locality: '',
    country: '',
    addressType: '', // 'business' or 'home'
    citizenship: '',
    multipleCitizenship: false,
    citizenships: [],
    residence: '',
    residenceDifferentFromCitizenship: false
  });
  const [citizenshipSearch, setCitizenshipSearch] = useState('');

  // Add state for yes/no questions
  const [hasCrossReference, setHasCrossReference] = useState(null); // null = not answered, true = yes, false = no
  const [hasFederalSponsorship, setHasFederalSponsorship] = useState(null); // null = not answered, true = yes, false = no

  // Completion status for each section
  const [completedSections, setCompletedSections] = useState({
    Title: false,
    'Cross-Reference to Related Applications': false,
    'Federally Sponsored Research or Development': false,
    Inventors: false,
    Abstract: false,
    Field: false,
    Background: false,
    Summary: false,
    Drawings: false,
    'Detailed Description': false
  });

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageNames, setImageNames] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Track sections needing review (persisted)
  const [sectionsNeedingReview, setSectionsNeedingReview] = useState(new Set());

  const sections = [
    'Title',
    'Cross-Reference to Related Applications',
    'Federally Sponsored Research or Development',
    'Inventors',
    'Abstract',
    'Field',
    'Background',
    'Summary',
    'Drawings',
    'Detailed Description'
  ];
  
  // Calculate actual completed sections
  const completedSectionsCount = [
    title.trim(),
    hasCrossReference !== null && (hasCrossReference ? crossReference.trim() : true),
    hasFederalSponsorship !== null && (hasFederalSponsorship ? federalResearch.trim() : true),
    inventors.some(inv => inv.name.trim() && inv.address.trim()),
    abstract.trim(),
    field.trim(),
    background.trim(),
    summary.trim(),
    drawings.trim(),
    detailedDescription.trim()
  ].filter(Boolean).length;

    // Load existing application data if editing
  const loadApplication = async () => {
    console.log('🔍 Load Application Debug:', {
      applicationId,
      hasApplicationId: !!applicationId,
      user: user?.id,
      currentUrl: window.location.pathname
    });
    
    if (applicationId && user && applicationId !== 'undefined' && applicationId !== 'null') {
      setIsLoading(true);
      try {
        console.log('🔍 Attempting to load application with ID:', applicationId);
        const application = await getPatentApplication(applicationId);
        console.log('🔍 Loaded application data:', application);
        // Populate form fields
        setTitle(application.title || '');
        setAbstract(application.abstract || '');
        setField(application.field || '');
        setBackground(application.background || '');
        setSummary(application.summary || '');
        setDrawings(application.drawings || '');
        setDetailedDescription(application.detailedDescription || '');
        setImages(application.images || []);
        setCrossReference(application.crossReference || '');
        setFederalResearch(application.federalResearch || '');
        
        // Set the yes/no question states based on existing data
        if (application.crossReference && application.crossReference.trim() !== '' && application.crossReference.trim() !== 'None') {
          setHasCrossReference(true);
        } else if (application.crossReference === 'None') {
          setHasCrossReference(false);
        }
        
        if (application.federalResearch && application.federalResearch.trim() !== '' && application.federalResearch.trim() !== 'None') {
          setHasFederalSponsorship(true);
        } else if (application.federalResearch === 'None') {
          setHasFederalSponsorship(false);
        }
        setInventors(application.inventors || []);
        // Set completion status
        if (application.completedSections) {
          setCompletedSections(application.completedSections);
        }
        // Restore sectionsNeedingReview from backend (array to Set)
        if (application.sections_needing_review) {
          setSectionsNeedingReview(new Set(application.sections_needing_review));
        } else {
          setSectionsNeedingReview(new Set());
        }
        // Restore lastStep from backend
        if (typeof application.lastStep === 'number' && application.lastStep >= 0) {
          setCurrentStep(application.lastStep);
        } else if (applicationId && applicationId !== 'undefined' && applicationId !== 'null') {
          // If we have an application ID but no lastStep, stay on current step
          // Don't reset to 0 for existing applications
        } else {
          setCurrentStep(0);
        }
      } catch (error) {
        console.error('Error loading application:', error);
        if (error.response?.status === 404) {
          navigate('/patent-buddy/wizard');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Only load application if we have an applicationId and user, and we're not currently saving
    if (applicationId && user && applicationId !== 'undefined' && applicationId !== 'null' && !isSaving) {
      // Check if we already have data loaded for this application
      const hasDataLoaded = title || abstract || field || background || summary || 
                           drawings || detailedDescription || inventors.length > 0;
      
      if (!hasDataLoaded) {
        loadApplication();
      }
    }
  }, [applicationId, user, isSaving]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal]);

    // Format title with proper punctuation and structure
  const formatTitle = (titleText) => {
    if (!titleText || titleText.trim() === '') return titleText;

    let formatted = titleText.trim();

    // Remove extra spaces
    formatted = formatted.replace(/\s+/g, ' ');

    // Ensure proper capitalization for patent titles
    // Convert to title case but preserve certain words in lowercase
    const lowerCaseWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'up', 'via', 'with'];

    formatted = formatted.toLowerCase().split(' ').map((word, index) => {
      // Always capitalize first and last word
      if (index === 0 || index === formatted.split(' ').length - 1) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      // Capitalize if it's not in the lowercase list or if it's a technical term
      if (!lowerCaseWords.includes(word) || word.length > 3) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }

      return word;
    }).join(' ');

    // Ensure proper punctuation at the end
    if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
      formatted = formatted + '.';
    }

    // Remove any double punctuation
    formatted = formatted.replace(/[.!?]+$/, '.');

    return formatted;
  };

  // Validate title structure and spelling
  const validateTitle = (titleText) => {
    const issues = [];
    
    if (!titleText || titleText.trim() === '') {
      return { isValid: false, issues: ['Title cannot be empty'] };
    }

    // Check minimum length
    if (titleText.trim().length < 10) {
      issues.push('Title should be at least 10 characters long');
    }

    // Check for proper capitalization
    const words = titleText.trim().split(' ');
    const firstWord = words[0];
    const lastWord = words[words.length - 1];
    
    if (firstWord && firstWord.charAt(0) !== firstWord.charAt(0).toUpperCase()) {
      issues.push('First word should be capitalized');
    }
    
    if (lastWord && lastWord.charAt(0) !== lastWord.charAt(0).toUpperCase()) {
      issues.push('Last word should be capitalized');
    }

    // Check for common spelling mistakes in patent titles
    const commonMistakes = {
      'invention': 'invention',
      'system': 'system',
      'method': 'method',
      'apparatus': 'apparatus',
      'device': 'device',
      'process': 'process',
      'technology': 'technology',
      'artificial intelligence': 'artificial intelligence',
      'machine learning': 'machine learning',
      'blockchain': 'blockchain',
      'internet of things': 'internet of things',
      'iot': 'IoT',
      'ai': 'AI',
      'ml': 'ML'
    };

    const lowerTitle = titleText.toLowerCase();
    for (const [mistake, correction] of Object.entries(commonMistakes)) {
      if (lowerTitle.includes(mistake) && !titleText.includes(correction)) {
        issues.push(`Consider using "${correction}" instead of "${mistake}"`);
      }
    }

    // Check for proper punctuation
    if (!titleText.endsWith('.') && !titleText.endsWith('!') && !titleText.endsWith('?')) {
      issues.push('Title should end with proper punctuation');
    }

    // Check for excessive punctuation
    if (titleText.match(/[.!?]{2,}/)) {
      issues.push('Remove excessive punctuation marks');
    }

    // Check for patent title conventions
    const patentConventions = [
      'System and Method for',
      'Apparatus for',
      'Method of',
      'Device for',
      'Process for'
    ];

    const hasConvention = patentConventions.some(convention => 
      titleText.toLowerCase().includes(convention.toLowerCase())
    );

    if (!hasConvention && titleText.length > 20) {
      issues.push('Consider using patent title conventions like "System and Method for" or "Apparatus for"');
    }

    return {
      isValid: issues.length === 0,
      issues: issues
    };
  };

  // Save application data
  const saveApplication = async (reloadAfterSave = true) => {
    if (!user) {
      setSaveMessage('Please log in to save your application');
      return;
    }
    setIsSaving(true);
    setSaveMessage('');
    try {
      const applicationData = {
        title,
        crossReference,
        federalResearch,
        inventors,
        abstract,
        field,
        background,
        summary,
        drawings,
        detailedDescription,
        images,
        completedSections,
        status: completedSectionsCount >= 8 ? 'complete' : 'draft',
        sections_needing_review: Array.from(sectionsNeedingReview),
        lastStep: currentStep, // Persist the current step
      };
      console.log('🔍 Save Application Debug:', {
        applicationId,
        hasApplicationId: !!applicationId,
        user: user.id,
        applicationData
      });
      let result;
      if (applicationId && applicationId !== 'undefined' && applicationId !== 'null') {
        // Update existing application
        console.log('🔍 Updating existing application with ID:', applicationId);
        result = await updatePatentApplication(applicationId, applicationData);
        console.log('🔍 Update result:', result);
        setSaveMessage('Application updated successfully!');
        // Ensure we're on the correct URL with the application ID
        if (window.location.pathname !== `/patent-buddy/wizard/${applicationId}`) {
          navigate(`/patent-buddy/wizard/${applicationId}`);
        }
        // Don't reload the application after saving to maintain current step
        // The application data is already in local state
      } else {
        // Save new application
        console.log('🔍 Creating new application (no applicationId found)');
        result = await savePatentApplication(applicationData);
        console.log('🔍 Save result:', result);
        setSaveMessage('Application saved successfully!');
        // Redirect to the saved application
        if (result && result.application && result.application.id) {
          navigate(`/patent-buddy/wizard/${result.application.id}`);
        }
      }
      // Log the backend response
      console.log('🔍 Backend save response:', result);
      // Clear save message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving application:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response?.data?.error?.includes('maximum limit of 5 patent applications')) {
        setSaveMessage('You have reached the maximum limit of 5 applications. Please delete an existing application before creating a new one.');
      } else {
        setSaveMessage(`Error saving application: ${error.response?.data?.error || error.message || 'Please try again.'}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to render section content
  const renderSectionContent = (stepKey) => {
    switch (stepKey) {
      case 'Title':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Title of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a clear, concise title that accurately describes your invention. Avoid overly broad or vague titles.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className={`w-full rounded-md shadow-sm focus:ring-blue-500 ${
                    titleValidation.isValid 
                      ? 'border-gray-300 focus:border-blue-500' 
                      : 'border-red-300 focus:border-red-500'
                  }`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    const validation = validateTitle(e.target.value);
                    setTitleValidation(validation);
                  }}
                  onBlur={(e) => {
                    const formatted = formatTitle(e.target.value);
                    setTitle(formatted);
                    const validation = validateTitle(formatted);
                    setTitleValidation(validation);
                  }}
                  placeholder='e.g., "System and Method for AI-Powered Content Generation"'
                />
                {!titleValidation.isValid && titleValidation.issues.length > 0 && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Title Structure Issues:</h4>
                    <ul className="space-y-1">
                      {titleValidation.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-700 flex items-start">
                          <span className="mr-2">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {titleValidation.isValid && title.trim() && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-green-800">Title structure looks good!</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Generation Section */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-purple-900 mb-3">Generate Title Suggestions</h3>
                <p className="text-purple-800 mb-4">Enter keywords or a description of your invention to get AI-generated title suggestions.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">Description or Keywords</label>
                    <textarea
                      rows={3}
                      className="w-full rounded-md border-purple-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                      value={titleGenerationInput}
                      onChange={(e) => setTitleGenerationInput(e.target.value)}
                      placeholder="Describe your invention, its key features, technology area, or enter relevant keywords..."
                    />
                  </div>
                  
                  <button
                    onClick={handleGenerateTitles}
                    disabled={isGeneratingTitles || !titleGenerationInput.trim()}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-md flex items-center justify-center ${
                      isGeneratingTitles || !titleGenerationInput.trim()
                        ? 'bg-purple-200 text-purple-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isGeneratingTitles ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Titles...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Title Suggestions
                      </>
                    )}
                  </button>
                  
                  {titleGenerationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{titleGenerationError}</p>
                    </div>
                  )}
                  
                  {generatedTitles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-purple-900">Generated Titles:</h4>
                      {generatedTitles.map((generatedTitle, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-purple-200 rounded-md hover:bg-purple-50">
                          <span className="text-sm text-purple-900 flex-1">{generatedTitle}</span>
                          <button
                            onClick={() => handleSelectTitle(generatedTitle)}
                            className="ml-3 px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 hover:bg-purple-200 rounded-md"
                          >
                            Use This Title
                          </button>
                        </div>
                      ))}
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => {
                            setTitleGenerationInput('');
                            setGeneratedTitles([]);
                            setTitleGenerationError('');
                          }}
                          className="text-sm text-purple-600 hover:text-purple-800"
                        >
                          Generate Different Titles
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-blue-900"
                  onClick={() => setShowTips(!showTips)}
                >
                  Tips for a Strong Title
                  <span>{showTips ? '▲' : '▼'}</span>
                </button>
                {showTips && (
                  <ul className="mt-2 space-y-2 text-sm text-blue-800">
                    <li>• Be specific about the technology area</li>
                    <li>• Include key technical features that make your invention unique</li>
                    <li>• Avoid marketing language or superlatives</li>
                    <li>• Keep it under 15 words if possible</li>
                  </ul>
                )}
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Title: !prev.Title }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Title
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Title ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'CrossReference':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cross-Reference to Related Applications</h2>
            
            {hasCrossReference === null ? (
              <>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Do you need to claim priority to an earlier patent application?</h3>
                  <p className="text-blue-800 mb-4">
                    This applies if you are filing a non-provisional application and want to claim the benefit of an earlier U.S. provisional application, 
                    or if you want to claim priority to a foreign patent application. This establishes an earlier filing date for your invention.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setHasCrossReference(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                      Yes, I need to claim priority
                    </button>
                    <button
                      onClick={() => {
                        setHasCrossReference(false);
                        setCrossReference('None');
                        setCompletedSections(prev => ({ ...prev, 'CrossReference': true }));
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                    >
                      No, not applicable
                    </button>
                  </div>
                </div>
              </>
            ) : hasCrossReference ? (
              <>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-800 mb-4">
                    <strong>You selected: Yes</strong><br/>
                    Please provide the details of the earlier application you are claiming priority to.
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cross-Reference Details</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={crossReference}
                    onChange={(e) => setCrossReference(e.target.value)}
                    placeholder="e.g., This application claims the benefit of U.S. Provisional Application No. 62/123,456, filed Jan. 1, 2023."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include the application number, filing date, and type of application (provisional, non-provisional, PCT, etc.)
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setHasCrossReference(null);
                      setCrossReference('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Change answer
                  </button>
                  <button
                    onClick={() => setCompletedSections(prev => ({ ...prev, 'CrossReference': !prev['CrossReference'] }))}
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                      completedSections['CrossReference']
                        ? 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    {completedSections['CrossReference'] ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-800">
                    <strong>You selected: No</strong><br/>
                    No cross-reference to related applications is needed for this patent application.
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setHasCrossReference(null);
                      setCrossReference('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Change answer
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600"
                    disabled
                  >
                    Completed
                  </button>
                </div>
              </>
            )}
          </div>
        );
      case 'FederalResearch':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Federally Sponsored Research or Development</h2>
            
            {hasFederalSponsorship === null ? (
              <>
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">Was your invention made with U.S. federal government support?</h3>
                  <p className="text-blue-800 mb-4">
                    This applies if your invention was developed under a federal contract, grant, or cooperative agreement. 
                    Examples include research funded by NSF, NIH, DARPA, DOE, or other federal agencies. 
                    You must disclose this information as required by federal law.
                  </p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setHasFederalSponsorship(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                    >
                      Yes, federally funded
                    </button>
                    <button
                      onClick={() => {
                        setHasFederalSponsorship(false);
                        setFederalResearch('None');
                        setCompletedSections(prev => ({ ...prev, 'FederalResearch': true }));
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                    >
                      No, not federally funded
                    </button>
                  </div>
                </div>
              </>
            ) : hasFederalSponsorship ? (
              <>
                <div className="bg-green-50 rounded-lg p-4 mb-6">
                  <p className="text-green-800 mb-4">
                    <strong>You selected: Yes</strong><br/>
                    Please provide the details of the federal funding support.
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Federal Funding Details</label>
                  <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    placeholder="e.g., This invention was made with government support under contract no. ABC-123 awarded by the National Science Foundation. The government has certain rights in the invention."
                    value={federalResearch}
                    onChange={(e) => setFederalResearch(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Include the contract/grant number, funding agency, and any government rights statement
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setHasFederalSponsorship(null);
                      setFederalResearch('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Change answer
                  </button>
                  <button
                    onClick={() => setCompletedSections(prev => ({ ...prev, 'FederalResearch': !prev['FederalResearch'] }))}
                    className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                      completedSections['FederalResearch']
                        ? 'text-white bg-green-600 hover:bg-green-700'
                        : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    {completedSections['FederalResearch'] ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-gray-800">
                    <strong>You selected: No</strong><br/>
                    No federal funding disclosure is required for this patent application.
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      setHasFederalSponsorship(null);
                      setFederalResearch('');
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    ← Change answer
                  </button>
                  <button
                    className="px-4 py-2 text-sm font-medium rounded-md text-white bg-green-600"
                    disabled
                  >
                    Completed
                  </button>
                </div>
              </>
            )}
          </div>
        );

      case 'Inventors':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventors</h2>
            <p className="text-gray-600 mb-6">List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution to the inventive concept.</p>
            
            <div className="space-y-6">
              {inventors.map((inventor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Inventor {index + 1}</h3>
                    {inventors.length > 1 && (
                      <button
                        onClick={() => {
                          const newInventors = inventors.filter((_, i) => i !== index);
                          setInventors(newInventors);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., John Smith"
                        value={inventor.name}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].name = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., 123 Main St, City, State, ZIP"
                        value={inventor.address}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].address = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., United States"
                        value={inventor.citizenship}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].citizenship = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residence</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., California"
                        value={inventor.residence}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].residence = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setInventors([...inventors, { name: '', address: '', citizenship: '', residence: '' }])}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                + Add Another Inventor
              </button>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Inventor Requirements</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Each inventor must have contributed to the conception of the invention</li>
                  <li>• Include all inventors who made significant contributions</li>
                  <li>• Provide complete and accurate information for each inventor</li>
                  <li>• All inventors must sign the application</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Inventors: !prev.Inventors }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Inventors
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Inventors ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Abstract':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a concise overview of your invention and its key advantages.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide a clear, concise summary of your invention, including its key features and advantages..."
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Abstract Best Practices</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Keep it concise but comprehensive</li>
                  <li>• Highlight key technical features</li>
                  <li>• Mention advantages over prior art</li>
                  <li>• Avoid overly technical jargon</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Abstract: !prev.Abstract }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Abstract
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Abstract ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Field':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Field of the Invention</h2>
            <p className="text-gray-600 mb-6">Describe the technical field or area of technology to which your invention relates.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Description</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g., This invention relates to the field of artificial intelligence and machine learning, specifically to natural language processing systems for content generation."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Tips for Field Section</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Be broad enough to encompass your invention</li>
                  <li>• Include relevant technical disciplines</li>
                  <li>• Avoid being too narrow or too broad</li>
                  <li>• Reference established technical areas</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Field: !prev.Field }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Field
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Field ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Background':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Background of the Invention</h2>
            <p className="text-gray-600 mb-6">Describe the problem your invention solves and the limitations of existing solutions.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Describe the specific problem or need that your invention addresses..."
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Background Section Guidelines</h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Focus on the problem, not just the solution</li>
                  <li>• Explain why existing solutions are inadequate</li>
                  <li>• Provide context for your invention</li>
                  <li>• Be objective and factual</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Background: !prev.Background }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Background
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Background ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Summary':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a concise overview of your invention and its key advantages.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a clear, concise summary of your invention, including its key features and advantages..."
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Summary Best Practices</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Keep it concise but comprehensive</li>
                  <li>• Highlight key technical features</li>
                  <li>• Mention advantages over prior art</li>
                  <li>• Avoid overly technical jargon</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Summary: !prev.Summary }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Summary
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Summary ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Drawings':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Brief Description of the Drawings</h2>
            <p className="text-gray-600 mb-6">Describe any drawings or figures that illustrate your invention.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Drawing Images</label>
                {isSupabaseAvailable() ? (
                  <>
                    {/* File Selection */}
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setSelectedFiles(files);
                          // Initialize names for new files
                          const newNames = {};
                          files.forEach((file, index) => {
                            const defaultName = `Figure ${images.length + index + 1}`;
                            newNames[file.name] = defaultName;
                          });
                          setImageNames(prev => ({ ...prev, ...newNames }));
                        }}
                        className="hidden"
                        id="file-input"
                      />
                      <label
                        htmlFor="file-input"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Select Images
                      </label>
                    </div>

                    {/* Selected Files with Names */}
                    {selectedFiles.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images:</h4>
                        <div className="space-y-3">
                          {selectedFiles.map((file, index) => (
                            <div key={file.name} className="flex items-center space-x-3">
                              <div className="flex-shrink-0 w-16 h-16 border rounded overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt={file.name} 
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-600 mb-1">{file.name}</p>
                                <input
                                  type="text"
                                  placeholder="Enter image name (e.g., Figure 1)"
                                  value={imageNames[file.name] || ''}
                                  onChange={(e) => setImageNames(prev => ({
                                    ...prev,
                                    [file.name]: e.target.value
                                  }))}
                                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={async () => {
                              if (!user || !applicationId) return;
                              setUploading(true);
                              setUploadError('');
                              try {
                                const uploaded = [];
                                for (const file of selectedFiles) {
                                  const img = await uploadPatentImage(file, user.id, applicationId || 'new');
                                  // Add the custom name to the uploaded image
                                  const namedImg = {
                                    ...img,
                                    name: imageNames[file.name] || file.name
                                  };
                                  uploaded.push(namedImg);
                                }
                                setImages(prev => [...prev, ...uploaded]);
                                setSelectedFiles([]);
                                setImageNames({});
                              } catch (err) {
                                setUploadError('Failed to upload image(s).');
                              } finally {
                                setUploading(false);
                              }
                            }}
                            disabled={uploading}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            {uploading ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload Images
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFiles([]);
                              setImageNames({});
                            }}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {uploadError && <div className="text-red-600 text-sm mb-2">{uploadError}</div>}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-2">
                    <p className="text-sm text-yellow-800">
                      Image upload is not available. Please configure Supabase environment variables to enable this feature.
                    </p>
                  </div>
                )}

                {/* Uploaded Images */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images:</h4>
                    <div className="flex flex-wrap gap-4">
                      {images.map((img, idx) => (
                        <div key={img.url} className="relative w-24 h-24 border rounded overflow-hidden group cursor-pointer">
                          <img 
                            src={img.url} 
                            alt={img.name} 
                            className="object-cover w-full h-full group-hover:opacity-80 transition-opacity"
                            onClick={() => {
                              setSelectedImage(img);
                              setShowImageModal(true);
                            }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 truncate">
                            {img.name}
                          </div>
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white bg-opacity-80 rounded-full p-1 text-xs hover:bg-opacity-100 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drawing Descriptions</label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={drawings}
                  onChange={(e) => setDrawings(e.target.value)}
                  placeholder="Describe your drawings, figures, or diagrams. For example: Figure 1 shows a block diagram of the system architecture..."
                />
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 mb-2">Drawing Guidelines</h4>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li>• Number your figures (Figure 1, Figure 2, etc.)</li>
                  <li>• Describe what each drawing shows</li>
                  <li>• Reference specific elements in the drawings</li>
                  <li>• Keep descriptions clear and technical</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Drawings: !prev.Drawings }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Drawings
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Drawings ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Detailed Description':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detailed Description of the Invention</h2>
            <p className="text-gray-600 mb-6">This is the most critical section. Provide a complete, detailed description of how your invention works.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                <textarea
                  rows={12}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={detailedDescription}
                  onChange={(e) => setDetailedDescription(e.target.value)}
                  placeholder="Provide a comprehensive description of your invention, including how it works, its components, and implementation details..."
                />
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">⚠️ Critical Section Requirements</h4>
                <ul className="space-y-2 text-sm text-red-800">
                  <li>• Must enable someone skilled in the art to make and use your invention</li>
                  <li>• Include specific implementation details</li>
                  <li>• Describe the "how" not just the "what"</li>
                  <li>• Provide sufficient detail for reproducibility</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, 'Detailed Description': !prev['Detailed Description'] }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections['Detailed Description']
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections['Detailed Description'] ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Introduction':
        return renderIntroductionSection();

      case 'Inventors':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Inventors{renderRequiredIndicator()}</h2>
            <p className="text-gray-600 mb-6">List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution to the inventive concept.</p>
            
            <div className="space-y-6">
              {inventors.map((inventor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Inventor {index + 1}</h3>
                    {inventors.length > 1 && (
                      <button
                        onClick={() => {
                          const newInventors = inventors.filter((_, i) => i !== index);
                          setInventors(newInventors);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., John Smith"
                        value={inventor.name}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].name = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., 123 Main St, City, State, ZIP"
                        value={inventor.address}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].address = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Citizenship</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., United States"
                        value={inventor.citizenship}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].citizenship = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Residence</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="e.g., California"
                        value={inventor.residence}
                        onChange={(e) => {
                          const newInventors = [...inventors];
                          newInventors[index].residence = e.target.value;
                          setInventors(newInventors);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setInventors([...inventors, { name: '', address: '', citizenship: '', residence: '' }])}
                className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors"
              >
                + Add Another Inventor
              </button>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Inventor Requirements</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Each inventor must have contributed to the conception of the invention</li>
                  <li>• Include all inventors who made significant contributions</li>
                  <li>• Provide complete and accurate information for each inventor</li>
                  <li>• All inventors must sign the application</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Inventors: !prev.Inventors }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Inventors
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Inventors ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Abstract':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a concise overview of your invention and its key advantages.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abstract</label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide a clear, concise summary of your invention, including its key features and advantages..."
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Abstract Best Practices</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Keep it concise but comprehensive</li>
                  <li>• Highlight key technical features</li>
                  <li>• Mention advantages over prior art</li>
                  <li>• Avoid overly technical jargon</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Abstract: !prev.Abstract }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Abstract
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Abstract ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Field':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Field of the Invention</h2>
            <p className="text-gray-600 mb-6">Describe the technical field or area of technology to which your invention relates.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Field Description</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="e.g., This invention relates to the field of artificial intelligence and machine learning, specifically to natural language processing systems for content generation."
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Tips for Field Section</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Be broad enough to encompass your invention</li>
                  <li>• Include relevant technical disciplines</li>
                  <li>• Avoid being too narrow or too broad</li>
                  <li>• Reference established technical areas</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Field: !prev.Field }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Field
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Field ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Background':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Background of the Invention</h2>
            <p className="text-gray-600 mb-6">Describe the problem your invention solves and the limitations of existing solutions.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Statement</label>
                <textarea
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  placeholder="Describe the specific problem or need that your invention addresses..."
                />
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">Background Section Guidelines</h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Focus on the problem, not just the solution</li>
                  <li>• Explain why existing solutions are inadequate</li>
                  <li>• Provide context for your invention</li>
                  <li>• Be objective and factual</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Background: !prev.Background }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Background
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Background ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Summary':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a concise overview of your invention and its key advantages.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea
                  rows={6}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Provide a clear, concise summary of your invention, including its key features and advantages..."
                />
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Summary Best Practices</h4>
                <ul className="space-y-2 text-sm text-green-800">
                  <li>• Keep it concise but comprehensive</li>
                  <li>• Highlight key technical features</li>
                  <li>• Mention advantages over prior art</li>
                  <li>• Avoid overly technical jargon</li>
                </ul>
              </div>

              {/* Completion Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCompletedSections(prev => ({ ...prev, Summary: !prev.Summary }))}
                  className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                    completedSections.Summary
                      ? 'text-white bg-green-600 hover:bg-green-700'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  {completedSections.Summary ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      case 'Drawings':
        return renderDrawingsSection();

      case 'DetailedDescription':
        return renderDetailedDescriptionSection();

      case 'Review':
        return renderReviewSection();

      default:
        return null;
    }
  };

  // Helper function to get section-specific help content
  const getSectionHelp = () => {
    const helpContent = {
      'Title': {
        title: 'Current Section: Title',
        description: 'The title should be brief but technically accurate, avoiding marketing language.',
        link: 'USPTO Patent Application Guide',
        url: 'https://www.uspto.gov/patents/basics/patent-process-overview'
      },
      'Cross-Reference to Related Applications': {
        title: 'Current Section: Cross-Reference to Related Applications',
        description: 'Required section. If you are claiming priority to an earlier U.S. or foreign patent application, provide the details. If not claiming priority, enter "None" or "Not applicable".',
        link: 'USPTO Priority Claims Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/priority-claims'
      },
      'Federally Sponsored Research or Development': {
        title: 'Current Section: Federally Sponsored Research or Development',
        description: 'Required section. If your invention was made with U.S. federal government support, you must disclose the details. If not federally funded, enter "None" or "Not applicable".',
        link: 'USPTO Federal Funding Disclosure',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/federally-sponsored-research'
      },
      'Inventors': {
        title: 'Current Section: Inventors',
        description: 'List all inventors who contributed to the conception of the invention. Each inventor must have made a significant contribution.',
        link: 'USPTO Inventor Requirements',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/inventorship'
      },
      'Abstract': {
        title: 'Current Section: Abstract',
        description: 'Provide a concise overview of your invention and its key advantages.',
        link: 'USPTO Abstract Guidelines',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/abstract-guidelines'
      },
      'Field': {
        title: 'Current Section: Field',
        description: 'Define the technical area your invention belongs to. Be broad enough to encompass your invention.',
        link: 'USPTO Field of Invention Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/field-invention'
      },
      'Background': {
        title: 'Current Section: Background',
        description: 'Describe the problem your invention solves and why existing solutions are inadequate.',
        link: 'USPTO Background Section Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/background-invention'
      },
      'Summary': {
        title: 'Current Section: Summary',
        description: 'Provide a concise overview of your invention and its key advantages.',
        link: 'USPTO Summary Guidelines',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/summary-invention'
      },
      'Drawings': {
        title: 'Current Section: Drawings',
        description: 'Describe any figures or diagrams that illustrate your invention.',
        link: 'USPTO Drawing Requirements',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/drawing-requirements'
      },
      'Detailed Description': {
        title: 'Current Section: Detailed Description',
        description: 'This is the most critical section. Provide complete details on how your invention works.',
        link: 'USPTO Detailed Description Guide',
        url: 'https://www.uspto.gov/patents/basics/using-legal-services/pro-se-assistance/detailed-description'
      }
    };
    return helpContent[currentStep] || helpContent['Title'];
  };

  // Generate USPTO format text for export
  const generateUSPTOFormatText = () => {
    let text = '';
    
    // Header
    text += 'UNITED STATES PATENT AND TRADEMARK OFFICE\n';
    text += 'PROVISIONAL APPLICATION FOR PATENT\n\n';
    text += 'Attorney Docket No.: [To be assigned]\n';
    text += 'Application No.: [To be assigned]\n';
    text += 'Filing Date: [To be assigned]\n\n';
    
    // Title
    text += `${title || '[TITLE OF THE INVENTION]'}\n\n`;
    
    // Inventors
    if (inventors && inventors.length > 0 && inventors.some(inv => inv.name.trim())) {
      text += `Inventor${inventors.filter(inv => inv.name.trim()).length > 1 ? 's' : ''}: `;
      text += inventors.filter(inv => inv.name.trim()).map(inv => inv.name).join(', ');
      text += '\n\n';
    }
    
    // Cross-Reference
    if (crossReference) {
      text += 'CROSS-REFERENCE TO RELATED APPLICATIONS\n\n';
      text += crossReference + '\n\n';
    }
    
    // Federal Research
    if (federalResearch) {
      text += 'STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT\n\n';
      text += federalResearch + '\n\n';
    }
    
    // Abstract
    if (abstract) {
      text += 'ABSTRACT\n\n';
      text += abstract + '\n\n';
    }
    
    // Field
    if (field) {
      text += 'FIELD OF THE INVENTION\n\n';
      text += field + '\n\n';
    }
    
    // Background
    if (background) {
      text += 'BACKGROUND OF THE INVENTION\n\n';
      text += background + '\n\n';
    }
    
    // Summary
    if (summary) {
      text += 'SUMMARY OF THE INVENTION\n\n';
      text += summary + '\n\n';
    }
    
    // Drawings
    if (drawings) {
      text += 'BRIEF DESCRIPTION OF THE DRAWINGS\n\n';
      text += drawings + '\n\n';
    }
    
    // Detailed Description
    if (detailedDescription) {
      text += 'DETAILED DESCRIPTION OF THE INVENTION\n\n';
      text += detailedDescription + '\n\n';
    }
    
    // Footer
    text += 'IMPORTANT NOTICE:\n';
    text += 'This is a draft provisional patent application prepared by ThinkTact AI.\n';
    text += 'Provisional applications do not require claims but must provide sufficient disclosure\n';
    text += 'to support any future non-provisional application.\n';
    text += 'This document should be reviewed by a qualified patent attorney or agent before filing with the USPTO.\n';
    
    return text;
  };

  // Add a live document preview in USPTO standard format
  const renderDocumentPreview = () => {
      return (
    <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-lg mt-8 max-w-4xl mx-auto" style={{ minHeight: 600, maxHeight: '80vh', overflow: 'auto' }}>
      {/* Repeating Diagonal ThinkTactAI Watermarks for Full Document Coverage */}
      {Array.from({ length: 30 }, (_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * 300}px`,
            left: '-30%',
            width: '160%',
            height: '200px',
            pointerEvents: 'none',
            zIndex: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-25deg)',
            overflow: 'hidden'
          }}
        >
          <span
            style={{
              fontSize: '120px',
              color: '#2563eb',
              opacity: 0.10,
              fontWeight: 900,
              letterSpacing: '12px',
              userSelect: 'none',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              lineHeight: '1.2'
            }}
          >
            ThinkTactAI
          </span>
        </div>
      ))}
      
              {/* Document Content - USPTO Official Format */}
        <div className="relative z-10" style={{ 
          fontFamily: 'Times New Roman, serif', 
          fontSize: '12pt', 
          lineHeight: '1.5', 
          color: 'black',
          textAlign: 'justify',
          margin: '0 auto',
          maxWidth: '6.5in',
          padding: '0.5in',
          position: 'relative',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto'
        }}>
          {/* Page Number */}
          {showPageNumbers && (
            <div style={{
              position: 'absolute',
              bottom: '0.25in',
              right: '0.5in',
              fontSize: '10pt',
              color: 'black'
            }}>
              1
            </div>
          )}
        {/* USPTO Official Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '1in',
          borderBottom: '2px solid black',
          paddingBottom: '0.25in'
        }}>
          <div style={{ 
            fontSize: '14pt', 
            fontWeight: 'bold', 
            marginBottom: '0.1in',
            letterSpacing: '0.05em'
          }}>
            UNITED STATES PATENT AND TRADEMARK OFFICE
          </div>
          <div style={{ 
            fontSize: '12pt', 
            fontWeight: 'bold', 
            marginBottom: '0.2in',
            letterSpacing: '0.03em'
          }}>
            PROVISIONAL APPLICATION FOR PATENT
          </div>
          <div style={{ 
            fontSize: '10pt', 
            lineHeight: '1.4',
            borderTop: '1px solid black',
            paddingTop: '0.1in',
            marginTop: '0.1in'
          }}>
            <div style={{ marginBottom: '0.05in' }}>Attorney Docket No.: [To be assigned]</div>
            <div style={{ marginBottom: '0.05in' }}>Application No.: [To be assigned]</div>
            <div>Filing Date: [To be assigned]</div>
          </div>
        </div>

        {/* Title Section - USPTO Format */}
        <div style={{ marginBottom: '0.5in', textAlign: 'center' }}>
          <div style={{ 
            fontSize: '14pt', 
            fontWeight: 'bold', 
            marginBottom: '0.2in',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            lineHeight: '1.3'
          }}>
            {title || '[TITLE OF THE INVENTION]'}
          </div>
          {inventors && inventors.length > 0 && inventors.some(inv => inv.name.trim()) && (
            <div style={{ 
              fontSize: '11pt',
              fontStyle: 'italic',
              marginBottom: '0.1in'
            }}>
              Inventor{inventors.filter(inv => inv.name.trim()).length > 1 ? 's' : ''}: {
                inventors.filter(inv => inv.name.trim()).map(inv => inv.name).join(', ')
              }
            </div>
          )}
        </div>

        {/* Cross-Reference Section - USPTO Format */}
        {crossReference && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              CROSS-REFERENCE TO RELATED APPLICATIONS
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {crossReference}
            </div>
          </div>
        )}

        {/* Federal Research Section - USPTO Format */}
        {federalResearch && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              STATEMENT REGARDING FEDERALLY SPONSORED RESEARCH OR DEVELOPMENT
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {federalResearch}
            </div>
          </div>
        )}

        {/* Abstract Section - USPTO Format */}
        {abstract && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              ABSTRACT
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {abstract}
            </div>
          </div>
        )}

        {/* Field of Invention Section - USPTO Format */}
        {field && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              FIELD OF THE INVENTION
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {field}
            </div>
          </div>
        )}

        {/* Background Section - USPTO Format */}
        {background && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              BACKGROUND OF THE INVENTION
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {background}
            </div>
          </div>
        )}

        {/* Summary Section - USPTO Format */}
        {summary && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              SUMMARY OF THE INVENTION
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {summary}
            </div>
          </div>
        )}

        {/* Brief Description of Drawings Section - USPTO Format */}
        {drawings && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              BRIEF DESCRIPTION OF THE DRAWINGS
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {drawings}
            </div>
          </div>
        )}

        {/* Detailed Description Section - USPTO Format */}
        {detailedDescription && (
          <div style={{ marginBottom: '0.4in' }}>
            <div style={{ 
              fontSize: '12pt', 
              fontWeight: 'bold', 
              marginBottom: '0.1in',
              textTransform: 'uppercase',
              letterSpacing: '0.01em'
            }}>
              DETAILED DESCRIPTION OF THE INVENTION
            </div>
            <div style={{ 
              textIndent: '0.25in',
              textAlign: 'justify',
              lineHeight: '1.6',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }}>
              {detailedDescription}
            </div>
          </div>
        )}

        {/* Missing Sections Notice */}


        {/* USPTO Official Footer */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '9pt', 
          marginTop: '0.5in', 
          paddingTop: '0.25in', 
          borderTop: '1px solid black',
          lineHeight: '1.4'
        }}>
          <div style={{ marginBottom: '0.1in', fontWeight: 'bold' }}>
            IMPORTANT NOTICE:
          </div>
          <div style={{ marginBottom: '0.1in' }}>
            This is a draft provisional patent application prepared by ThinkTact AI.
          </div>
          <div style={{ marginBottom: '0.1in' }}>
            Provisional applications do not require claims but must provide sufficient disclosure 
            to support any future non-provisional application.
          </div>
          <div style={{ fontStyle: 'italic' }}>
            This document should be reviewed by a qualified patent attorney or agent before filing with the USPTO.
          </div>
        </div>
      </div>
    </div>
  );
  };

  // Helper function to check if a section is completed
  const isSectionCompleted = (stepKey) => {
    switch (stepKey) {
      case 'Introduction':
        return true; // Introduction is always considered completed once viewed
      case 'Title':
        return title.trim() !== '';
      case 'CrossReference':
        return hasCrossReference !== null && (hasCrossReference ? crossReference.trim() !== '' : true);
      case 'FederalResearch':
        return hasFederalSponsorship !== null && (hasFederalSponsorship ? federalResearch.trim() !== '' : true);
      case 'Inventors':
        return inventors.some(inv => inv.name.trim() && inv.address.trim());
      case 'Abstract':
        return abstract.trim() !== '';
      case 'Field':
        return field.trim() !== '';
      case 'Background':
        return background.trim() !== '';
      case 'Summary':
        return summary.trim() !== '';
      case 'Drawings':
        return drawings.trim() !== '';
      case 'DetailedDescription':
        return detailedDescription.trim() !== '';
      default:
        return false;
    }
  };

  // Helper function to get step display name
  const getStepDisplayName = (stepKey) => {
    switch (stepKey) {
      case 'Introduction':
        return 'Introduction';
      case 'Title':
        return 'Title of Invention';
      case 'CrossReference':
        return 'Cross-Reference to Related Applications';
      case 'FederalResearch':
        return 'Federally Sponsored Research or Development';
      case 'Inventors':
        return 'Inventors';
      case 'Abstract':
        return 'Abstract';
      case 'Field':
        return 'Field of Invention';
      case 'Background':
        return 'Background';
      case 'Summary':
        return 'Summary';
      case 'Drawings':
        return 'Drawings';
      case 'DetailedDescription':
        return 'Detailed Description';
      case 'Review':
        return 'Review & Save';
      default:
        return stepKey;
    }
  };

  // Helper function to check if step needs review
  const needsReview = (stepKey) => {
    return sectionsNeedingReview.has(stepKey);
  };

  // Mark section for review
  const markForReview = (stepKey) => {
    setSectionsNeedingReview(prev => new Set([...prev, stepKey]));
  };

  // Clear review mark when section is completed
  const clearReviewMark = (stepKey) => {
    setSectionsNeedingReview(prev => {
      const newSet = new Set(prev);
      newSet.delete(stepKey);
      return newSet;
    });
  };

  // Title generation function
  const handleGenerateTitles = async () => {
    if (!titleGenerationInput || titleGenerationInput.trim().length < 10) {
      setTitleGenerationError('Please provide a description with at least 10 characters to generate titles.');
      return;
    }

    setIsGeneratingTitles(true);
    setTitleGenerationError('');

    try {
      const result = await generatePatentTitles(titleGenerationInput);
      setGeneratedTitles(result.titles);
    } catch (error) {
      setTitleGenerationError(error.message || 'Failed to generate titles. Please try again.');
    } finally {
      setIsGeneratingTitles(false);
    }
  };

  const handleSelectTitle = (selectedTitle) => {
    setTitle(selectedTitle);
    setShowTitleGenerationPopup(false);
    setTitleGenerationInput('');
    setGeneratedTitles([]);
    setTitleGenerationError('');
  };

  const handleCloseTitlePopup = () => {
    setShowTitleGenerationPopup(false);
    setTitleGenerationInput('');
    setGeneratedTitles([]);
    setTitleGenerationError('');
  };

  // Inventor popup handlers
  const handleOpenInventorPopup = () => {
    setShowInventorPopup(true);
    setInventorPopupStep(1);
    setNewInventor({
      name: '',
      address: '',
      addressCont: '',
      locality: '',
      country: '',
      addressType: '',
      citizenship: '',
      multipleCitizenship: false,
      citizenships: [],
      residence: '',
      residenceDifferentFromCitizenship: false
    });
    setCitizenshipSearch('');
  };

  const handleCloseInventorPopup = () => {
    setShowInventorPopup(false);
    setInventorPopupStep(1);
    setNewInventor({
      name: '',
      address: '',
      addressCont: '',
      locality: '',
      country: '',
      addressType: '',
      citizenship: '',
      multipleCitizenship: false,
      citizenships: [],
      residence: '',
      residenceDifferentFromCitizenship: false
    });
    setCitizenshipSearch('');
  };

  const handleInventorNextStep = () => {
    if (inventorPopupStep === 1 && newInventor.name.trim()) {
      setInventorPopupStep(2);
    } else if (inventorPopupStep === 2 && newInventor.address.trim() && newInventor.locality.trim() && newInventor.country.trim() && newInventor.addressType) {
      setInventorPopupStep(3);
    } else if (inventorPopupStep === 3) {
      // Check if we need to ask about residence
      if (newInventor.multipleCitizenship || !newInventor.citizenship) {
        setInventorPopupStep(4);
      } else {
        // Single citizenship - ask if residence is different
        setInventorPopupStep(4);
      }
    } else if (inventorPopupStep === 4) {
      // Add the inventor
      let residence = '';
      if (newInventor.residenceDifferentFromCitizenship) {
        residence = newInventor.residence;
      } else {
        // Use citizenship as residence
        residence = newInventor.multipleCitizenship ? newInventor.citizenships[0] : newInventor.citizenship;
      }
      
      // Combine address fields into a single address string
      const addressParts = [
        newInventor.address.trim(),
        newInventor.addressCont.trim(),
        newInventor.locality.trim(),
        newInventor.country.trim()
      ].filter(part => part.length > 0);
      
      const fullAddress = addressParts.join(', ');
      
      const inventorToAdd = {
        name: newInventor.name.trim(),
        address: fullAddress,
        citizenship: newInventor.multipleCitizenship ? newInventor.citizenships.join(', ') : newInventor.citizenship,
        residence: residence
      };
      setInventors([...inventors, inventorToAdd]);
      handleCloseInventorPopup();
    }
  };

  const handleInventorPrevStep = () => {
    if (inventorPopupStep > 1) {
      setInventorPopupStep(inventorPopupStep - 1);
    }
  };

  const handleAddCitizenship = () => {
    if (newInventor.citizenship && !newInventor.citizenships.includes(newInventor.citizenship)) {
      setNewInventor(prev => ({
        ...prev,
        citizenships: [...prev.citizenships, newInventor.citizenship],
        citizenship: ''
      }));
    }
  };

  const handleCountrySelection = (country) => {
    if (newInventor.multipleCitizenship) {
      if (!newInventor.citizenships.includes(country)) {
        setNewInventor(prev => ({
          ...prev,
          citizenships: [...prev.citizenships, country]
        }));
      }
    } else {
      setNewInventor(prev => ({ ...prev, citizenship: country }));
    }
    setCitizenshipSearch('');
  };



  const handleRemoveCitizenship = (citizenshipToRemove) => {
    setNewInventor(prev => ({
      ...prev,
      citizenships: prev.citizenships.filter(c => c !== citizenshipToRemove)
    }));
  };

  const filteredCountries = allCountries.filter(country =>
    country.toLowerCase().includes(citizenshipSearch.toLowerCase())
  );

  // Render progress tracker sidebar
  const renderProgressTracker = () => (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto">
      {/* Logo & Title */}
      <div className="flex items-center space-x-3 mb-8">
        <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="font-bold text-xl text-gray-900">Patent Buddy</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 mb-8">
        <Link 
          to="/patent-applications"
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          My Applications
        </Link>
      </nav>

      {/* Progress Tracker */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Application Progress</h3>
        <div className="space-y-2">
          {getWizardSteps().map((step, index) => {
            const isCurrent = index === currentStep;
            const isCompleted = isSectionCompleted(step.key);
            const needsReviewFlag = needsReview(step.key);
            
            return (
              <div
                key={step.key}
                className={`flex items-center p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg' // Strong blue highlight for current
                    : isCompleted
                    ? 'border-green-200 bg-green-50'
                    : needsReviewFlag
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={async () => {
                  if (index !== currentStep) {
                    setIsSaving(true);
                    try {
                      await saveApplication(false); // Do not reload after save when navigating
                      setCurrentStep(index);
                    } finally {
                      setIsSaving(false);
                    }
                  }
                }}
              >
                {/* Step Number */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCurrent
                    ? 'bg-white text-blue-600 border-2 border-blue-600' // White circle with blue border for current
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : needsReviewFlag
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Info */}
                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : needsReviewFlag ? 'text-yellow-900' : 'text-gray-700'
                  }`}>
                    {getStepDisplayName(step.key)}
                  </p>
                  {needsReviewFlag && (
                    <p className="text-xs text-yellow-700 mt-1">Needs review</p>
                  )}
                </div>

                {/* Status Icons */}
                <div className="flex-shrink-0">
                  {needsReviewFlag && !isCompleted && (
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Progress Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Completed:</span>
            <span className="font-medium text-green-600">
              {getWizardSteps().filter(step => isSectionCompleted(step.key)).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Needs Review:</span>
            <span className="font-medium text-yellow-600">
              {sectionsNeedingReview.size}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium text-gray-600">
              {getWizardSteps().length - getWizardSteps().filter(step => isSectionCompleted(step.key)).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Add "Save Draft" button to each step
  const renderSaveDraftButton = () => (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <button
        type="button"
        onClick={async () => {
          try {
            await saveApplication();
          } catch (error) {
            console.error('Error saving draft:', error);
          }
        }}
        disabled={isSaving}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving Draft...' : 'Save Draft'}
      </button>
    </div>
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patent application...</p>
        </div>
      </div>
    );
  }

  // Update the main return to include sidebar
  try {
    return (
      <div className="flex h-screen bg-gray-50">
        {/* Left Sidebar - Progress Tracker */}
        {renderProgressTracker()}

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="min-h-screen flex flex-col p-8">
            {/* Navigation Buttons - Moved to top */}
            <div className="w-full max-w-2xl mx-auto flex justify-between mb-6">
              <button
                type="button"
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className={`px-6 py-2 rounded-md font-medium ${currentStep === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'}`}
              >
                Back
              </button>
              
              {/* Save message - positioned between back and next buttons */}
              {saveMessage && (
                <div className="flex-1 mx-4 text-center">
                  <div className={`px-4 py-2 rounded-md text-sm font-medium ${
                    saveMessage.includes('Error') || saveMessage.includes('⚠️') 
                      ? 'text-red-700 bg-red-100 border border-red-200' 
                      : 'text-green-700 bg-green-100 border border-green-200'
                  }`}>
                    {saveMessage}
                  </div>
                </div>
              )}
              
              {currentStep === getWizardSteps().length - 1 ? (
                <button
                  type="button"
                  onClick={saveApplication}
                  className="px-6 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-6 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>

            {/* Save Draft Button */}
            {getWizardSteps()[currentStep]?.key !== 'Introduction' && renderSaveDraftButton()}

            {/* Progress Indicator */}
            <div className="w-full flex justify-center items-center mb-6">
              {renderProgress()}
            </div>

            {/* Step Content */}
            <div className="w-full max-w-2xl mx-auto">
              {renderCurrentStep()}
            </div>

            {/* Document Preview */}
            <div className="w-full max-w-4xl mx-auto mt-8">
              {/* Preview Mode Toggle */}
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setPreviewMode('uspto')}
                      className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white"
                    >
                      USPTO Format Preview
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Export Options */}
              <div className="flex justify-center mb-4 space-x-4">
                <button
                  onClick={() => setShowPremiumPopup(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Export as PDF
                </button>
                
                {previewMode === 'uspto' && (
                  <label className="flex items-center space-x-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={showPageNumbers}
                      onChange={(e) => setShowPageNumbers(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show Page Numbers</span>
                  </label>
                )}
              </div>
              
              {renderDocumentPreview()}
            </div>
          </div>
        </div>

        {/* Premium Feature Popup */}
        {showPremiumPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md mx-4 shadow-xl">
              <div className="text-center">
                {/* Premium Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h3>
                
                <p className="text-gray-600 mb-6">
                  PDF export functionality is a premium feature that will be available after the beta period. 
                  This will allow you to download your patent applications as professional PDF documents.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Coming Soon Features:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Professional PDF formatting</li>
                    <li>• USPTO-compliant layouts</li>
                    <li>• High-quality document export</li>
                    <li>• Print-ready files</li>
                  </ul>
                </div>
                
                <button
                  onClick={() => setShowPremiumPopup(false)}
                  className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Back to Patent Buddy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Title Generation Popup */}
        {showTitleGenerationPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg mx-4 shadow-xl">
              <div className="text-center">
                {/* Title Generation Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Generate Patent Titles</h3>
                
                <p className="text-gray-600 mb-6">
                  Describe your invention in simple terms and we'll generate professional patent title suggestions for you.
                </p>

                {/* Input Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Brief Description of Your Invention
                  </label>
                  <textarea
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={titleGenerationInput}
                    onChange={(e) => setTitleGenerationInput(e.target.value)}
                    placeholder="Describe what your invention does, what problem it solves, or its main features..."
                  />
                </div>

                {/* Generate Button */}
                <div className="mb-6">
                  <button
                    onClick={handleGenerateTitles}
                    disabled={isGeneratingTitles || !titleGenerationInput.trim()}
                    className={`w-full px-6 py-3 font-medium rounded-lg transition-colors ${
                      isGeneratingTitles || !titleGenerationInput.trim()
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isGeneratingTitles ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Titles...
                      </>
                    ) : (
                      'Generate Title Options'
                    )}
                  </button>
                </div>

                {/* Error Message */}
                {titleGenerationError && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{titleGenerationError}</p>
                  </div>
                )}

                {/* Generated Titles */}
                {generatedTitles.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Generated Title Options</h4>
                    <div className="space-y-3">
                      {generatedTitles.map((generatedTitle, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectTitle(generatedTitle)}
                          className="w-full text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">{generatedTitle}</span>
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={handleCloseTitlePopup}
                  className="w-full px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  No thanks, I'll create my own
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Inventor Popup */}
        {showInventorPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-lg mx-4 shadow-xl">
              <div className="text-center">
                {/* Inventor Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-600 to-blue-600 mb-6">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Inventor</h3>
                
                {/* Step Indicator */}
                <div className="flex justify-center mb-6">
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step <= inventorPopupStep
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1: Full Name */}
                {inventorPopupStep === 1 && (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Full Legal Name</h4>
                    <p className="text-gray-600 mb-6">
                      Enter the inventor's full legal name as it appears on official documents.
                    </p>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800"
                        value={newInventor.name}
                        onChange={(e) => setNewInventor(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., John Michael Smith"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Address */}
                {inventorPopupStep === 2 && (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Current Address</h4>
                    <p className="text-gray-600 mb-6">
                      Provide the inventor's current address and specify whether it's a business or home address.
                    </p>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Address Type
                      </label>
                      <div className="flex justify-center space-x-6">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="addressType"
                            value="home"
                            checked={newInventor.addressType === 'home'}
                            onChange={(e) => setNewInventor(prev => ({ ...prev, addressType: e.target.value }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Home Address</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="addressType"
                            value="business"
                            checked={newInventor.addressType === 'business'}
                            onChange={(e) => setNewInventor(prev => ({ ...prev, addressType: e.target.value }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Business Address</span>
                        </label>
                      </div>
                    </div>

                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800"
                          value={newInventor.address}
                          onChange={(e) => setNewInventor(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="e.g., 123 Main Street"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Continued (Optional)
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800"
                          value={newInventor.addressCont}
                          onChange={(e) => setNewInventor(prev => ({ ...prev, addressCont: e.target.value }))}
                          placeholder="e.g., Apartment 4B, Suite 200"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Locality (City, State/Province) *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800"
                          value={newInventor.locality}
                          onChange={(e) => setNewInventor(prev => ({ ...prev, locality: e.target.value }))}
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800"
                          value={newInventor.country}
                          onChange={(e) => setNewInventor(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="e.g., United States"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Citizenship */}
                {inventorPopupStep === 3 && (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Citizenship</h4>
                    <p className="text-gray-600 mb-6">
                      Specify the inventor's citizenship. If they have multiple citizenships, you can add all that apply.
                    </p>
                    
                    <div className="mb-6">
                      <label className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={newInventor.multipleCitizenship}
                          onChange={(e) => setNewInventor(prev => ({ ...prev, multipleCitizenship: e.target.checked }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">This person has multiple citizenships</span>
                      </label>
                    </div>

                    {!newInventor.multipleCitizenship ? (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country of Citizenship
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800 pr-10"
                            value={citizenshipSearch}
                            onChange={(e) => setCitizenshipSearch(e.target.value)}
                            placeholder="Start typing to search for a country..."
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        
                        {citizenshipSearch && (
                          <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
                            {filteredCountries.map((country) => (
                              <button
                                key={country}
                                onClick={() => handleCountrySelection(country)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 text-gray-900"
                              >
                                {country}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {newInventor.citizenship && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <span className="text-sm text-blue-800">Selected: {newInventor.citizenship}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Add Countries of Citizenship
                        </label>
                        <div className="relative mb-3">
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800 pr-20"
                            value={citizenshipSearch}
                            onChange={(e) => setCitizenshipSearch(e.target.value)}
                            placeholder="Start typing to search for a country..."
                          />
                          <button
                            onClick={handleAddCitizenship}
                            disabled={!newInventor.citizenship}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
                          >
                            Add
                          </button>
                        </div>
                        
                        {citizenshipSearch && (
                          <div className="mb-3 max-h-32 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
                            {filteredCountries.map((country) => (
                              <button
                                key={country}
                                onClick={() => handleCountrySelection(country)}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 text-gray-900"
                              >
                                {country}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {newInventor.citizenships.length > 0 && (
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Selected Countries:</label>
                            {newInventor.citizenships.map((citizenship, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-md">
                                <span className="text-sm text-gray-700">{citizenship}</span>
                                <button
                                  onClick={() => handleRemoveCitizenship(citizenship)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Residence */}
                {inventorPopupStep === 4 && (
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Step 4: Country of Residence</h4>
                    <p className="text-gray-600 mb-6">
                      {newInventor.multipleCitizenship 
                        ? `The inventor has multiple citizenships: ${newInventor.citizenships.join(', ')}.`
                        : `The inventor's citizenship is: ${newInventor.citizenship}.`
                      }
                    </p>
                    
                    <div className="mb-6">
                      <label className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={newInventor.residenceDifferentFromCitizenship}
                          onChange={(e) => setNewInventor(prev => ({ 
                            ...prev, 
                            residenceDifferentFromCitizenship: e.target.checked,
                            residence: e.target.checked ? prev.residence : ''
                          }))}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Current residence is different from citizenship</span>
                      </label>
                    </div>

                    {newInventor.residenceDifferentFromCitizenship && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country of Residence
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-white placeholder-gray-400 bg-gray-800 pr-10"
                            value={citizenshipSearch}
                            onChange={(e) => setCitizenshipSearch(e.target.value)}
                            placeholder="Start typing to search for a country..."
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                        
                        {citizenshipSearch && (
                          <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
                            {filteredCountries.map((country) => (
                              <button
                                key={country}
                                onClick={() => {
                                  setNewInventor(prev => ({ ...prev, residence: country }));
                                  setCitizenshipSearch('');
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 text-gray-900"
                              >
                                {country}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {newInventor.residence && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                            <span className="text-sm text-blue-800">Selected Residence: {newInventor.residence}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!newInventor.residenceDifferentFromCitizenship && (
                      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-green-800">
                            Residence will be set to: {newInventor.multipleCitizenship ? newInventor.citizenships[0] : newInventor.citizenship}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleInventorPrevStep}
                    disabled={inventorPopupStep === 1}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      inventorPopupStep === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={handleInventorNextStep}
                    disabled={
                      (inventorPopupStep === 1 && !newInventor.name.trim()) ||
                      (inventorPopupStep === 2 && (!newInventor.address.trim() || !newInventor.locality.trim() || !newInventor.country.trim() || !newInventor.addressType)) ||
                      (inventorPopupStep === 3 && !newInventor.multipleCitizenship && !newInventor.citizenship) ||
                      (inventorPopupStep === 3 && newInventor.multipleCitizenship && newInventor.citizenships.length === 0) ||
                      (inventorPopupStep === 4 && newInventor.residenceDifferentFromCitizenship && !newInventor.residence)
                    }
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      (inventorPopupStep === 1 && !newInventor.name.trim()) ||
                      (inventorPopupStep === 2 && (!newInventor.address.trim() || !newInventor.locality.trim() || !newInventor.country.trim() || !newInventor.addressType)) ||
                      (inventorPopupStep === 3 && !newInventor.multipleCitizenship && !newInventor.citizenship) ||
                      (inventorPopupStep === 3 && newInventor.multipleCitizenship && newInventor.citizenships.length === 0) ||
                      (inventorPopupStep === 4 && newInventor.residenceDifferentFromCitizenship && !newInventor.residence)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {inventorPopupStep === 4 ? 'Add Inventor' : 'Next'}
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseInventorPopup}
                  className="w-full mt-4 px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('🔍 Error rendering PatentAudit component:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">There was an error loading the patent application wizard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};

// At the bottom, export the wizard as a named component
export const PatentApplicationWizard = PatentAudit;