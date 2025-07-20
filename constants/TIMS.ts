const TIMS = [
  {
    "id": 1,
    "name": "Everest Base Camp Trek",
    "Transit_Pass_Cost": { "Sagarmatha NP": 3000, "Khumbu Municipality Fee": 2000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Solukhumbu"
  },
  {
    "id": 2,
    "name": "Annapurna Circuit Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Manang, Mustang, Myagdi, Lamjung, Kaski"
  },
  {
    "id": 3,
    "name": "Langtang Valley Trek",
    "Transit_Pass_Cost": { "Langtang NP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Rasuwa"
  },
  {
    "id": 4,
    "name": "Ghorepani Poon Hill Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Myagdi, Kaski"
  },
  {
    "id": 5,
    "name": "Gokyo Lakes Trek",
    "Transit_Pass_Cost": { "Sagarmatha NP": 3000, "Khumbu Municipality Fee": 2000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Solukhumbu"
  },
  {
    "id": 6,
    "name": "Three Passes Trek",
    "Transit_Pass_Cost": { "Sagarmatha NP": 3000, "Khumbu Municipality Fee": 2000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Solukhumbu"
  },
  {
    "id": 7,
    "name": "Everest View Trek",
    "Transit_Pass_Cost": { "Sagarmatha NP": 3000, "Khumbu Municipality Fee": 2000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Solukhumbu"
  },
  {
    "id": 8,
    "name": "Mardi Himal Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Kaski"
  },
  {
    "id": 9,
    "name": "Khopra Danda Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Myagdi"
  },
  {
    "id": 10,
    "name": "Tamang Heritage Trail",
    "Transit_Pass_Cost": { "Langtang NP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Rasuwa"
  },
  {
    "id": 11,
    "name": "Gosainkunda Trek",
    "Transit_Pass_Cost": { "Langtang NP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Rasuwa"
  },
  {
    "id": 12,
    "name": "Helambu Trek",
    "Transit_Pass_Cost": { "Shivapuri Nagarjun NP": 1000, "Langtang NP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Sindhupalchowk, Nuwakot"
  },
  {
    "id": 13,
    "name": "Ama Dablam Base Camp Trek",
    "Transit_Pass_Cost": { "Sagarmatha NP": 3000, "Khumbu Municipality Fee": 2000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Solukhumbu"
  },
  {
    "id": 14,
    "name": "Arun Valley Trek",
    "Transit_Pass_Cost": { "Makalu Barun NP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Sankhuwasabha, Bhojpur"
  },
  {
    "id": 15,
    "name": "Pikey Peak Trek",
    "Transit_Pass_Cost": { "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 1000,
    "trekker_area": "Solukhumbu, Okhaldhunga"
  },
  {
    "id": 16,
    "name": "Rolwaling Valley Trek",
    "Transit_Pass_Cost": { "GCAP": 3000, "TIMS": 1000, "Rolwaling RAP": 1400 },
    "Total_Transit_Cost_NPR": 5400,
    "trekker_area": "Dolakha"
  },
  {
    "id": 17,
    "name": "Dudh Kunda Trek",
    "Transit_Pass_Cost": { "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 1000,
    "trekker_area": "Solukhumbu"
  },
  {
    "id": 18,
    "name": "Jiri to Everest Base Camp Trek",
    "Transit_Pass_Cost": { "GCAP": 3000, "Sagarmatha NP": 3000, "Khumbu Municipality Fee": 2000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 9000,
    "trekker_area": "Dolakha, Solukhumbu"
  },
  {
    "id": 19,
    "name": "Annapurna Base Camp Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Kaski, Myagdi"
  },
  {
    "id": 20,
    "name": "Tilicho Lake Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Manang"
  },
  {
    "id": 21,
    "name": "Nar Phu Valley Trek",
    "Transit_Pass_Cost": { "Nar Phu RAP": 7000, "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 11000,
    "trekker_area": "Manang"
  },
  {
    "id": 22,
    "name": "Jomsom Muktinath Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Mustang"
  },
  {
    "id": 23,
    "name": "Sikles Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Kaski"
  },
  {
    "id": 24,
    "name": "Royal Trek",
    "Transit_Pass_Cost": { "ACAP": 3000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 4000,
    "trekker_area": "Kaski"
  },
  {
    "id": 25,
    "name": "Langtang Gosainkunda Helambu Trek",
    "Transit_Pass_Cost": { "Langtang NP": 3000, "Shivapuri Nagarjun NP": 1000, "TIMS": 1000 },
    "Total_Transit_Cost_NPR": 5000,
    "trekker_area": "Rasuwa, Nuwakot, Sindhupalchowk"
  }
]

export default TIMS;