## Task

Develop a webApp named as "ResoLogix"

## Purpose

Reserve Evaluation in Oil and Gas industry in the same way as Rose & Associates RoseRA/MMRA.

## Steps 1 - Calculate OOIP or OGIP

- Take a few parameters: Area ("A"), Net Pay ("h"), Porosity ("Phi"), Water Saturation ("Sw"), Formation Volume Factor ("Boi"), Recovery Efficiency ("RE"), and
- each parameter shall have specific distributions (normally, LogNormal distribution is a good guess for all of the parameters), this step shall be addressed in a "Settings" window or tab, and
- the end user shall provide or specify the P10 and P90 values for each parameters;
- then calculate the results with specific formulae: 
  - OOIP = (7758 * A * h * Phi * (1 - Sw)) / Boi
  - Recoverable Oil = OOIP * RE
- after calculation, a few decent plots shall be provided, demonstrating the histograms, with PDF/CDF curves;

## Step 2 - Risk Analysis

The Risk Analysis function shall be addressed, including:

- Source
- Timing / Migration
- Reservoir Quality
- Closures
- Containment / Seal



## Examples

- PetroCalc - OOIP & Recoverable Reserves: https://ahd2o0.github.io/petrocalc-web/ooip_recoverable.html

- Original Oil In Place Calculator: https://codingace.net/eng/original_oil_in_place.html



Can you come up with a plan of:

- What frameworks of frontend and backend (with a database, sqlite3 or MySQL preferred) we shall choose?
- Any options or advice do you have?



## Fine-Tuning



### Reserve Profile Part:

- This part shall be located in the sub-panel of SCENARIO NAME and DESCRIPTION (below them).
- This part is collapsed by default and all items have "undefined" as their default value in case of no attention/input initiated by the users.
- This part shall have the following features (each feature has multiple choices seperated by comma):
  - Country: with a Drop-down choice box of all countries
  - Geol-Basin: with a Drop-down choice box of a list: (Alaska ANWR, Alaska Beaufort Sea, Alaska North Slope, Alaska NPRA, Alberta Basin, Amu-Darya Basin, Angara-Terrace, Anglo-Dutch Basin, Assam, Azov-Kuban Basin, Baram Delta/Brunei-Sabah Basin, Baykit Arch, Bohaiwan Basin, Bombay Basin, Bonaparte Gulf Basin, Browse Basin, Campeche-Sigsbe Salt Basin, Campos Basin, Carpathian-Balkanian Basin, Central Oman Platform, Central Sumatra Basin, Cis-Patom Foredeep, Dnieper-Donets Basin, East Greenland Rift Basins, East Venezuela Basin, Esprito Santo Basin, Fahud Salt Basin, Falklands Plateau, Foz do Amazonas Basin, Gaba Salt Basin, Ganges-Brahmaputra Delta, Ghudin-Khasfeh Flank Province, Gippsland Basin, Grand Erg/Ahnet Basin, Greater Antilles Deformed Belt, Greater Ghawar Uplift, Greater Sarawak Basin, Gulf of Guinea, Gulf of Mexico, Guyana-Suriname Basin, Huqf-Haushi Uplift, Illizi Basin, Indus, Interior Homocline-Central Arch, Irrawddy, Junngar Basin, Kohat-Potwar, Kutei Basin, Labrador-Newfoundland Shelf, Lesser Antilles Deformed Belt, Llanos Basin, Ludlov Saddle, Magallenes Basin, Malay Basin, Malvinas Basin, Maracaibo Basin, Ma'Rib-Al Jawf/Masila Basin, Masila-Jeza Basin, Mesopotamian Foredeep Basin, Middle Caspian Basin, Middle Magdalena, Nepa-Botuoba Arch, Neuquen Basin, Niger Delta, North Barents Basin, North Carpathian Basin, North Caspian Basin, North Sakhalin Basin, North Sea Graben, North Sumatra Basin, North Ustyurt Basin, Northwest German Basin, Northwest Java Basin, Northwest Shelf, Oman Mountains, Orange River Coastal, Ordos Basin, Pannonian Basin, Pelagian Basin, Pelotas Basin, Po Basin, Progreso Basin, Provence Basin, Putumayo-Oriente-Maranon Basin, Qatar Arch, Red Sea Basin, Rocky Moutain Deformed Belt, Rub Al Khali Basin, Saline-Comalcalco Basin, San Jorge Basin, Santa Cruz-Tarija Basin, Santos Basin, Seirra Madre de Chiapas-Peten Foldbelt, Senegal, Sergipe-Alagoas Basin, Shabwah Basin, Sichuan Basin, Sirte Basin, Songliao Basin, South Barents Basin, South Caspian Basin, South Oman Salt basin, South Sumatra Basin, Talara Basin, Tampico-Misantla Basin, Tarim Basin, Timan-Pechora Basin, Tobago Trough, Transylvanian Basin, Trias Ghadames Basin, Veracruz Basin, Vestford-Helgeland, Villahermosa Uplift, Volga-Urals Region, Wadi-Surhan Basin, West Siberian Basin, West-Central Coastal, Widyan Basin-Interior Platform, Williston Basin, Yucatan Platform, Zagros Fold Belt)
  - Play-Type: with a Drop-down choice box of a list: (Independent Closure, Fault Dependent Closure, Salt Flank Dependent Closure, Stratigraphic, Combined)
  - Reservoir-Age: with a Drop-down choice box of a list: (Pleistocene, Tertiary, U Pliocene, M Pliocene, L Pliocene, U Miocene, M Miocene, L Miocene, Oligocene, Eocene, Paleocene, Upper Cretaceous, Middle Cretaceous, Lower Cretaceous, Upper Jurassic, Middle Jurassic, Lower Jurassic, Upper Triassic, Middle Triassic, Lower Triassic, Permian, Pennsylvanian, Mississippian, Carboniferous, Devonian, Silurian, Ordovician, Cambrian, Precambrian)
  - Lithology: with a Drop-down choice box of a list: (Basement, Carbonates, Chalk, Coal, Dolomite, Limestone, Sandstone, Siltstone, Shale, Volcanics, Undifferentiated)
  - Depo-Env: with a Drop-down choice box of a list: (Alluvial Fan, Atoll, Beach/Nearshore, Chalk/Deepwater Carb, Deltaic, Dune, Fluvial Channel, Fluvial Deltaic, Overbank Splay, Reef, Reef Talus, Shelf, Slope, Tidal Channel/Bar, Tidal Flat, 
    Turbidite/Fan, Turbidite/Overbank, Turbidite/Channel)
  - Exp-Stage: with a Drop-down choice box of a list: (Lead, Prospect)
  - Terrain: with a Drop-down choice box of a list: (Mountains, Plains, Desert, Transitional, Offshore Shelf, Offshore Deep-Water, Offshore Ultra-Deep-Water)
  - Lahee-Class: with a Drop-down choice box of a list: (New Field Wildcat, New Pool Wildcat, Deeper Pool Test, Shallower Pool Test, Extension or Appraisal Test, Development Well)



### Redesign the header

- Move the "MC Runs" and "Run Sim" buttons down into the left pane, right above the "New" and "Save" buttons;
- Move the toggleable "Oil Reservoir" and "Gas Reservoir" buttons down into the box of "SCENARIO NAME" and "DESCRPTION". And these 2 buttons can be in a "stack-up" style if needed.
- Add "Monte Carlo Sim" (for current computing engine) and "DCA" buttons at the left side of our product logo and app name:
  - Monte Carlo Sim is the primary engine for Reserve Evaluation at this moment
  - Clicking "DCA"  button shall bring the user to a new page, stating:
    - DCA (Decline Curve Analysis) is our alternative engine based on production analysis.
    - The DCA based computing engine is in development phase.
    - Visit us frequently for more details and opportunities.
- Add "Docs" and "About" buttons on the right side of the header, but right before the theme-toggle button. Clicking the "Docs" button shall lead to a new Page showcasing the background of the Reserve Evaluation, Monte Carlo theory, and the Formulae behind the scene, plus a simple tutorial of how to use our RoseLogix app. Clicking "About" button leads to a pop-up window showing the Product information: 
  - ResoLogix (Logo and name)
  - version info taking from `package.json` file
  - Text of "All rights reserved @2026"
  - Text of "An alfazen.org Product"



### Merge Data tables

- Merge the "PARAMETER DATA TABLE" and "RESERVE DATA TABLE" into one called "Reserve Evaluation Results", including all of the columns from the 2 tables
- Only include the following in the "PROB" column:
  - P90
  - P50
  - MEAN
  - P10

### Minor Touch-ups

- Please make the "Close" button on the "About" Dialogue window narrower, as the current one is too long, a little bit ugly. If you can make the "Close" button to be a smaller "Close" icon, moving to the top-right corner of the dialogue window, it's gonna be way better.

- When switching to "Light" theme, a few buttons' fore texts become unclear due to very close background color and the font color, for instance, 
  - the "Monte Carlo Sim" button at Header section
  - the "Primary (Oil)" button and "Secondary (Solution Gas)" button at PROBABILITY DISTRIBUTIONS graph
  - "Chance: 44.8%" box at GEOLOGICAL RISK section
- Please sync the version number in Docs page with the project version number.
- Please make a fancy favicon.ico for this Reserve Evaluation project.
- Let's tune the App Name of "ResoLogix" in Header: Please adjust the font size of "ResoLogix" to be bigger, such that the Text of "ResoLogix" can allign by both sides against the underlaying "RESERVE EVALUATION". 
- In the "RESERVE PROFILE" Section, please add another item named "TYPE-WELL" with Default value of "None", while it can be edited by a user.
- Add one more number of "50000" at MC Runs.
- Remove "ASSOCIATED" from "ASSOCIATED SECONDARY PRODUCT PARAMATERS" for Oil and Gas Reservoir;
- In case of "With Secondary", change the name of second parameter to be "Secondary Product RE", more generic.
- In "RESERVE EVALUATION RESULTS" data table:
- Change "PRIMARY LIQUID YEILD" to "PRIMARY YIELD";
- Change "SECONDARY FLUID YIELD" to "SECONDARY YIELD".
- In case of "Gas Reservoir", the PRIMARY YIELD shall be "GAS", please correct it.


### Evaluation Reporting Function

- The Reporting Part shall be right below the 2 Data Tables;
- It shall bear four radio-box buttons to be toggled: 
  - Take Image Snapshots:
  - Generate PDF Reports:
  - Create PPTX Slides:
  - Draft  Word Reports:
- Down below the above radio-boxes, there should be some checkboxes to select with: 
  - Reserve Profile: Normally ignored
  - Reserve Parameters and Evaluation Results: 
    - the P10, MEAN, P50 and P90 values against the input parameters and output results
    - the P10, MEAN, P50 and P90 values are as Row Name to make landscape print-out when creating PPTX slides
    - the P10, MEAN, P50 and P90 values are as Column Name to make portrait print-out when drafting Word reports
  - Geological Risk Inputs and Results (the 5 factors value and the final Pg)
  - Probability Distributions plots: Including the Exceedance (CDF) and Relative Density (PDF) for the Primary and Secondary products. That's 4 plots or 2 plots if without secondary product.
- Then a button named as "Implement the Task" to accomplish the job as per the settings above.
- When creating the reports, the user shall be able to save them into a local folder, or cloud drive, or even email to an email box if the zipped files are smaller than 8 MB.

**Problems reported**:

- The Reporting Functions don't work at all, basically it can neither take any snapshots nor create any reports of any kind.

- The "Take Image Snapshots" is core part of the 4 functions; because it creates the pictures, which will be fetched into the PPTX slides, or PDF/Word reports.

  
