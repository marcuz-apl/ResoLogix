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



### Versioning system
Please set up the versioning in the format of "m.n.p":
- "m" is the major version, can be 2-digit, numbering from 0 to 99
- "n" is the minor version, 1-digit, numbering from 0 to 9
- "p" is the patch version, 1-digit, numbering from 0 to 9
- the version starts from 0.0.1
- the patch number increment by 1 for every commit, same for major version and minor version
- when the patch version reaches 9, next increment/patch will lead 1 increment on minor version, while patch version back to 0;
- the same logic shall be applied on minor version increment.



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
- Please make the "VOLUMETRIC PARAMETERS" and "GEOLOGICAL RISK" sections collapsed by default; and link the two sections together by sharing their "expanded" state through the central context.
- I have created and saved a scenario in the WebApp and obviously it resides in the database and I can access it every time I browse to http://localhost:3000; but switching to 127.0.0.1 or the host IP address, such scenario doesn't get loaded. Please make sure I can access this example scenario by using IP address.

### pre-commit question
Q: Before committing, is there a way to setup the commit message automatically in the format of "v1.0.12 build 2026-06-10-0930"? the version number shall be pulled from the package.json file, while the build number is actally the current date and Time in the format of "YYYY-MM-DD-HHMM".

A: I have successfully configured this for you by creating a Git hook!
I added a new script at .git/hooks/prepare-commit-msg. This hook runs automatically immediately after your pre-commit hook (which bumps the version) but before the commit message is actually saved.
Here's how it works:
It reads the newly bumped version directly from package.json (e.g., 1.0.12).
It generates the current date and time in the exact format you requested (YYYY-MM-DD-HHMM).
It combines them into your format: v1.0.12 build 2026-06-10-0930.
How it will look when you commit:
```text
v1.0.12 build 2026-06-10-0930
Updated some features
```
If you simply run git commit, your editor will open with v1.0.12 build 2026-06-10-0930 already pre-filled.
If you run git commit -m "Updated some features", it will automatically prepend the formatted string, making your final commit message look like this:


### Evaluation Reporting Function

- The Evaluation Reporting Part shall be right below the "RESOURCE EVALUATION RESULTS" Data Table;
  - All reports shall be saved in a local folder ./reports and will be compressed to a zip file later if the "Create Reports" button is activated, and the zip file will be deleted 10 minutes after the task is completed. If the user fails to download the zip file, the zip file shall be kept in the ./reports folder for the user to download later. If the user selects to save the reports in a cloud drive or email to an email box, the zip file will be sent to the cloud drive or email box and keep there for the user's disposal. If the user selects to save the reports locally, the user will need to select the folder where the zip file will be saved. Also the size of the zip file shall be limited to 20 MB, otherwise split to multiple zip files, each with a size of 20 MB (the last zip file may be smaller than 20 MB).
- It shall be able to generate the following things, depending on user's selection (check boxes are needed in the GUI):
  - an Excel xlsx or comma-delimited csv file of the "RESOURCE EVALUATION RESULTS" data table, in landscape format, plus a transposed version of such for later outputting to Word report as the transposed results will be in portrait format (for print out in A4 or Letter size).
  - an Excel xlsx or comma-delimited csv file of the "GEOLOGICAL RISK" input section, in portrait format
  - Four images in PNG format of the "PROBABILITY DISTRIBUTIONS" section of Primary and Secondary products, including both cumulative and density distributions. If no secondary product, then only 2 pictures. The images shall be saved in a subfolder under ./reports named after the current date and time and the project name.
- a PPTX slides including the following content:
    - Title page with Project Name and "ResoLogix" and the date of the reporting in the format of "4 June 2026"
    - "RESOURCE EVALUATION RESULTS" data table in landscape format (i.e. the values of "PROB" as rows, not columns, i.e. P10, P50, P90 and Mean as rows, not columns)
    - "GEOLOGICAL RISK" input section always in portrait format with "RISK FACTOR" and "PROB" as the 2 column names, while the data pairs will be the 5 factors plus the "Chance of Success (Pg)" as the last row (i.e. always as 6 rows of data).
    - Four images of the "PROBABILITY DISTRIBUTIONS" section of Primary and Secondary products, including both cumulative and density distributions. If no secondary product, then only 2 pictures.
    - The slides shall be able to be printed out in landscape format.
    - The Title page image background is set to white color, not transparent.
- a Word-format report shall be created with the same contents of the PPTX slide file, but the "RESOURCE EVALUATION RESULTS" data table in portrait format.
- a PDF-format report shall be the same as the Word-format report.

- The "Create Reports" and "Download the Reports" buttons shall be the last items in the "Evaluation Reporting" section, and shall be a message box telling the user of the progress of the task, such as,
  - "Report Generation Started on [Time]" 
  - "Copying Reserve Parameters"
  - "Copying Geological Risk Factors"
  - "Generating Probability Distribution Plots"
  - "Generating Summary Data Tables"
  - "Generating PPTX Slides"
  - "Generating Word Report"
  - "Generating PDF Report"
  - "Zipping and Compressing Reports"
  - "Report Generation Completed at [Time]"
  - "The reports will stay alive for 10 minutes, after that it will be deleted. Please download it."
  - "If you fail to download the reports within 10 minutes, the reports will be deleted. You will need to regenerate them."
  - "If you select to save the reports in a cloud drive or email to an email box, the zip file will be sent to the cloud drive or email box and keep there for the user's disposal. If the user selects to save the reports locally, the user will need to select the folder where the zip file will be saved."
- I'll let you to design the Funtions and interface and come up with best-fit tech stack to achieve this.


### Footer
- The footer shall be under every page of the application, and it will keep consistent across the application.  It will be 1 line and in smaller fonts than the main text.  The footer will contain three items, copyright, created by and last updated.  The copyright shall be in the format of "Copyright (c) 2026 ResoLogix", the created by shall be in the format of "Created by alfazen.org", and the last updated shall be in the format of "Last Updated on [Date]", and the date will be updated automatically.
- The footer shall be right below the content of the current page, with a small spacing between the content and the footer.  The background color of the footer shall be the same as the background color of the current page.  The text color of the footer shall be black.
- On the row of the footer, the left corner shall include "Get in Touch(mailto:[EMAIL_ADDRESS])", then followed by ", " and "LinkedIn(href=https://www.linkedin.com/company/alfazen-org)".
- On the right-side corner, there shall be a few social icons with links such as, web icon (https://alfazen.org), Twitter icon(https://x.com/marcuszou), LinkedIn icon (https://www.linkedin.com/in/marcuszou/).

### Authentication and User Profile

It's great so far! Thanks gemini.
Currently we have pretty much all functions ready except a concern: After I created a Scenario and saved to the backend database, when my colleagues access the web app, he can modify/delete the scenario, that's bad. then a user management function or authentication system is needed, isn't it?
- there shall be a "Log In" icon, at the top-right corner at the Header section, located righr before the "Tools" button;
- If clicking that icon, the user shall be guided to a login pop-up window, to sign in; sign-in can be via userid + password or through a 3rd-party authentication, say Google, or iCloud, or Github.
- If the user has never registered with the webapp, there shall be icon of "Not registered? Sign up now" and an "Forgot password" button. The user can receive a newly-generated random password by the WebApp backend, and the user must change the password once he logs in to his profile.
-  There shall a chance for those lazy or busy users, not register, not log in, but stay on the web app interface to finish a quick Resource Evaluation (One evaluation at a time); If the web browser got closed by accident, the session  is over and can not retrieve anything.
- any other thoughts? please advise.

Can you help on this authentication and user profile system?


  
