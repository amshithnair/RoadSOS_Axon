**ROADSoS**

Frontend Feature List

*React Native Android --- Complete Implementation Guide*

  --------------------- -------------------------------------------------
  **Field**             **Detail**

  Platform              React Native --- Android (Expo managed workflow)

  Total screens         19 screens across 8 flows

  Total features        \~90 frontend features documented

  Priority scale        P1 = Must have for demo \| P2 = Should have \| P3
                        = Nice to have

  Offline scale         ✅ Full \| ⚠️ Partial \| ❌ Requires internet

  Document for          Frontend developer --- all UI, logic, state, and
                        interaction requirements
  --------------------- -------------------------------------------------

+-----------------------------------------------------------------------+
| How to read this document:                                            |
|                                                                       |
| → Section 1: Global features that apply to every screen (read this    |
| first)                                                                |
|                                                                       |
| → Section 2: Screen-by-screen feature tables --- every screen has its |
| own feature list                                                      |
|                                                                       |
| → Section 3: UI component library --- reusable components to build    |
| once, use everywhere                                                  |
|                                                                       |
| → Section 4: Permissions, libraries, and storage reference            |
|                                                                       |
| → Section 5: Priority build order                                     |
+-----------------------------------------------------------------------+

**Section 1 --- Global Features (Every Screen)**

These apply across the entire app. Build these first --- they underpin
every screen.

**1.1 Language System**

  ---------------------- -------------- -------------- -------------- --------------------
  **Feature**            **Type**       **Priority**   **Offline?**   **Notes**

  Language toggle        State / UI     P1             ✅ Full        English · Hindi ·
                                                                      Gujarati. Stored in
                                                                      AsyncStorage.

  All UI strings         Architecture   P1             ✅ Full        No hardcoded English
  externalised                                                        text anywhere in
                                                                      JSX. All from i18n
                                                                      file.

  Language persists on   State          P1             ✅ Full        Read from
  restart                                                             AsyncStorage on app
                                                                      launch.

  Language toggle on     UI             P1             ✅ Full        3-option selector.
  Setup screen                                                        Changes all text
                                                                      immediately.

  Emergency numbers      Logic          P1             ✅ Full        108/100/101 for IN,
  localised                                                           911 for US, 999 for
                                                                      UK etc.
  ---------------------- -------------- -------------- -------------- --------------------

**1.2 Offline Status Indicator**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Green dot --- live     UI         P1             ✅ Full        Overpass API
  data                                                            reachable. Shown top
                                                                  bar every screen.

  Orange dot --- offline UI         P1             ✅ Full        API unreachable,
  DB                                                              serving bundled JSON
                                                                  data.

  Red dot --- no data    UI         P1             ✅ Full        API failed AND no
                                                                  offline DB loaded
                                                                  yet.

  \'Offline data\' badge UI         P1             ✅ Full        Small badge on each
  on cards                                                        result card when
                                                                  served from local
                                                                  DB.

  Auto-retry when back   Logic      P2             N/A            When connectivity
  online                                                          restored, silently
                                                                  refresh results.
  ---------------------- ---------- -------------- -------------- --------------------

**1.3 Navigation**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Bottom tab bar --- 4   UI         P1             ✅ Full        Home · Profile ·
  tabs                                                            Medical QR · Safe
                                                                  Arrival

  Back navigation        UI         P1             ✅ Full        Top-left back arrow
                                                                  on all non-home
                                                                  screens.

  Android hardware back  UI         P1             ✅ Full        Handle correctly on
  button                                                          every screen.
                                                                  Crime/Silent SOS =
                                                                  disabled.

  Emergency exit to Home UI         P1             ✅ Full        Long-press back
                                                                  button (500ms) =
                                                                  force return Home
                                                                  from any screen.

  No navigation          UI         P2             ✅ Full        Instant transition.
  animation on SOS                                                No slide/fade delay
  screens                                                         in emergency flows.
  ---------------------- ---------- -------------- -------------- --------------------

**1.4 Location System**

  ---------------------- ---------- -------------- -------------- -------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Get current GPS on     Logic      P1             ✅ Full        expo-location
  screen mount                                                    getCurrentPositionAsync
                                                                  on every Emergency
                                                                  screen.

  Show place name not    UI         P1             ⚠️ Partial     Nominatim reverse
  coordinates                                                     geocode. Offline
                                                                  fallback: show lat/lng.

  Location accuracy      UI         P2             ✅ Full        Show \'Accurate to Xm\'
  indicator                                                       below location bar.

  Location permission    Logic      P1             ✅ Full        Request on Permissions
  prompt                                                          screen. Graceful
                                                                  degradation if denied.

  KM marker manual       UI / Logic P1             ✅ Full        Available on Emergency +
  override                                                        Breakdown screens. See
                                                                  Screen 18.
  ---------------------- ---------- -------------- -------------- -------------------------

**1.5 Global UI Rules**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Minimum touch target   UI         P1             ✅ Full        All buttons, cards,
  48x48dp                                                         icons. Critical for
                                                                  panicked users.

  High contrast text     UI         P1             ✅ Full        Never grey text on
                                                                  grey background.
                                                                  WCAG AA minimum.

  No loading spinners on UI         P1             ✅ Full        Show cached/offline
  Emergency screens                                               result immediately.
                                                                  Update silently.

  Dark mode not required UI         P3             ✅ Full        Light mode only for
                                                                  V1.

  Font size minimum 16sp UI         P1             ✅ Full        Readability under
  body                                                            stress and bright
                                                                  sunlight.

  Haptic feedback on SOS UI         P1             ✅ Full        Single strong
  trigger                                                         vibration when SOS
                                                                  is confirmed.

  Screen keep-awake on   Logic      P1             ✅ Full        expo-keep-awake.
  Emergency screen                                                Screen must not
                                                                  sleep during active
                                                                  incident.
  ---------------------- ---------- -------------- -------------- --------------------

**Section 2 --- Screen-by-Screen Feature List**

  -----------------------------------------------------------------------
  **ONBOARDING FLOW --- 4 Screens**

  -----------------------------------------------------------------------

**Screen 1 --- Splash Screen**

  -------------------------- ---------- -------------- -------------- ------------------------
  **Feature**                **Type**   **Priority**   **Offline?**   **Notes**

  ROADSoS logo centred       UI         P1             ✅ Full        SVG logo. Brand green
                                                                      background.

  Tagline: \'Help finds      UI         P1             ✅ Full        White text, below logo.
  you.\'                                                              

  Auto-navigate after 1.5s   Logic      P1             ✅ Full        Check AsyncStorage for
                                                                      \'onboardingComplete\'
                                                                      flag.

  Route:                     Logic      P1             ✅ Full        Skip onboarding for
  onboardingComplete=true →                                           returning users.
  Home                                                                

  Route:                     Logic      P1             ✅ Full        First launch only.
  onboardingComplete=false →                                          
  Onboarding                                                          

  Pre-load offline DB while  Logic      P1             ✅ Full        Load bundled JSON into
  splash shows                                                        AsyncStorage in
                                                                      background during 1.5s.
  -------------------------- ---------- -------------- -------------- ------------------------

**Screen 2 --- Onboarding (3 slides)**

  ---------------------- ---------- -------------- -------------- ----------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  3 swipeable slides     UI         P1             ✅ Full        Simple SVG
  with illustrations                                              illustrations per
                                                                  slide. No external
                                                                  images.

  Slide 1: Any           UI         P1             ✅ Full        Tagline + 2-line body
  emergency. Any device.                                          text.

  Slide 2: You\'re never UI         P1             ✅ Full        Petrol pump /
  alone.                                                          bystander concept.

  Slide 3: Works without UI         P1             ✅ Full        Offline concept
  internet.                                                       illustration.

  Dot pagination         UI         P1             ✅ Full        3 dots. Active dot =
  indicator                                                       green filled. Inactive
                                                                  = grey outline.

  Swipe gesture to       UI         P1             ✅ Full        FlatList horizontal or
  advance                                                         react-native-swiper.

  \'Next\' button (right UI         P1             ✅ Full        On slides 1-2. Changes
  side)                                                           to \'Get Started\' on
                                                                  slide 3.

  \'Skip\' button (top   UI         P2             ✅ Full        Skips to Permissions
  right)                                                          screen.

  \'Get Started\' CTA    UI         P1             ✅ Full        On slide 3 only. Large
                                                                  green button. →
                                                                  Permissions screen.

  Mark                   Logic      P1             ✅ Full        Written on \'Get
  onboardingComplete in                                           Started\' tap. Never
  AsyncStorage                                                    shown again.
  ---------------------- ---------- -------------- -------------- ----------------------

**Screen 3 --- Permissions**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Location permission    UI / Logic P1             ✅ Full        Icon + label +
  row                                                             description + status
                                                                  badge.
                                                                  expo-location.

  Contacts permission    UI / Logic P1             ✅ Full        expo-contacts. Shows
  row                                                             granted/denied
                                                                  badge.

  SMS permission row     UI / Logic P1             ✅ Full        expo-sms or
                                                                  react-native-sms.
                                                                  Shows granted/denied
                                                                  badge.

  \'Allow All\' primary  UI / Logic P1             ✅ Full        Triggers all 3 OS
  button                                                          permission dialogs
                                                                  sequentially.

  \'Skip for now\' ghost UI         P1             ✅ Full        → Setup screen.
  button                                                          Permissions
                                                                  requested on first
                                                                  actual use.

  Permission denied      Logic      P1             ✅ Full        If denied: show
  graceful handling                                               \'Open Settings\'
                                                                  link instead of
                                                                  permission row.

  Status badge per row   UI         P2             ✅ Full        Green \'Granted\' /
                                                                  Red \'Denied\' /
                                                                  Grey \'Not asked\'.

  → Setup screen after   Logic      P1             ✅ Full        Navigate after all
  resolution                                                      dialogs handled
                                                                  (accepted or
                                                                  skipped).
  ---------------------- ---------- -------------- -------------- --------------------

**Screen 4 --- Setup / Profile (also accessible from Profile tab)**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Section A: Emergency   UI         P1             ✅ Full        Up to 3 contacts.
  Contacts                                                        Name + phone per
                                                                  contact.

  \'Import from          UI / Logic P2             ✅ Full        Opens device
  contacts\' button                                               contacts picker.
                                                                  Prefills name +
                                                                  phone.

  Add / Remove contact   UI         P1             ✅ Full        \+ Add button below
  rows                                                            contacts. Trash icon
                                                                  to remove.

  Section B: Medical     UI         P1             ✅ Full        Blood group
  Info                                                            dropdown + allergies
                                                                  field + medications
                                                                  field.

  Blood group dropdown   UI         P1             ✅ Full        Options: A+ A- B+ B-
                                                                  O+ O- AB+ AB- ·
                                                                  Unknown.

  Allergies text field   UI         P1             ✅ Full        Free text.
                                                                  Placeholder: \'e.g.
                                                                  Penicillin,
                                                                  Aspirin\'.

  Medications text field UI         P1             ✅ Full        Free text.
                                                                  Placeholder: \'e.g.
                                                                  Metformin 500mg\'.

  Section C: Language    UI         P1             ✅ Full        3 pill buttons:
  selector                                                        English · हिंदी ·
                                                                  ગુજરાતી. Single
                                                                  select.

  Section D: Safe        UI         P2             ✅ Full        Link to Safe Arrival
  Arrival shortcut                                                setup screen.

  \'Save\' button        UI / Logic P1             ✅ Full        Writes all fields to
                                                                  AsyncStorage. Shows
                                                                  success toast.

  Auto-save on field     Logic      P2             ✅ Full        Save each field on
  blur                                                            unfocus. No explicit
                                                                  save needed.

  Pre-fill from          Logic      P1             ✅ Full        Load existing saved
  AsyncStorage on mount                                           values on screen
                                                                  open.

  Form validation        Logic      P1             ✅ Full        Phone numbers:
                                                                  digits only, min 10
                                                                  chars. Blood group:
                                                                  required.
  ---------------------- ---------- -------------- -------------- --------------------

  -----------------------------------------------------------------------
  **HOME SCREEN**

  -----------------------------------------------------------------------

**Screen 5 --- Home Screen**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  ROADSoS logo top-left  UI         P1             ✅ Full        Small. Tappable ---
                                                                  no action (just
                                                                  brand).

  Offline status dot     UI         P1             ✅ Full        See Section 1.2.
  top-centre                                                      Always visible.

  Profile icon top-right UI         P1             ✅ Full        Tap → Setup/Profile
                                                                  screen.

  \'What\'s the          UI         P1             ✅ Full        Localised. Below top
  emergency?\' heading                                            bar.

  Button: 🚗 Accident /  UI         P1             ✅ Full        Red. Large
  Crash                                                           (top-left). → Triage
                                                                  screen.

  Button: 🔥 Car Fire    UI         P1             ✅ Full        Orange. Large
                                                                  (top-right). →
                                                                  Evacuation Guide.

  Button: 🔧 Breakdown   UI         P1             ✅ Full        Blue. Medium
                                                                  (mid-left). →
                                                                  Breakdown screen.

  Button: ⛽ Out of Fuel UI         P1             ✅ Full        Purple. Medium
                                                                  (mid-right). →
                                                                  Breakdown (fuel
                                                                  filter).

  Button: 🌊 Flood /     UI         P1             ✅ Full        Teal. Medium
  Natural                                                         (bottom-left). →
                                                                  Emergency (flood
                                                                  mode).

  Button: 🚨 Crime /     UI         P1             ✅ Full        Slate. Medium
  Theft                                                           (bottom-right). →
                                                                  Silent SOS screen.

  \'I\'m a bystander\'   UI         P1             ✅ Full        Full-width, bottom.
  ghost strip                                                     Ghost/outline style.
                                                                  → Bystander confirm.

  Safe arrival active    UI / Logic P2             ✅ Full        Persistent yellow
  banner                                                          bar when timer
                                                                  active. Tap to check
                                                                  in.

  6-button grid layout   UI         P1             ✅ Full        2-column grid. Top 2
                                                                  = large (accident +
                                                                  fire). Rest =
                                                                  medium.

  Button press animation UI         P1             ✅ Full        Scale down 0.96 on
                                                                  press. 100ms spring
                                                                  animation.

  Button labels in       UI         P1             ✅ Full        All 6 button labels
  selected language                                               localised.
  ---------------------- ---------- -------------- -------------- --------------------

  -----------------------------------------------------------------------
  **🚗 MEDICAL FLOW**

  -----------------------------------------------------------------------

**Screen 6 --- Triage Screen**

  ---------------------- ---------- -------------- -------------- -----------------------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Red header bar:        UI         P1             ✅ Full        Full-width red header.
  \'Quick check\'                                                 

  3-dot progress         UI         P1             ✅ Full        Top of screen. Fills green as user
  indicator                                                       answers.

  Question 1: \'Is       UI         P1             ✅ Full        Large text. Two full-width YES / NO
  anyone unconscious?\'                                           buttons below.

  Question 2: \'Is there UI         P1             ✅ Full        Shown after Q1 answered. Slide-in
  heavy bleeding?\'                                               animation.

  Question 3: \'Is       UI         P1             ✅ Full        Shown after Q2 answered.
  anyone trapped?\'                                               

  Auto-advance to next   Logic      P1             ✅ Full        No \'Next\' button. Tapping YES/NO
  question on answer                                              immediately shows Q2.

  YES button style       UI         P1             ✅ Full        Red background. White text. Large. Left
                                                                  half.

  NO button style        UI         P1             ✅ Full        Grey outline. Dark text. Large. Right
                                                                  half.

  Severity calculation   Logic      P1             ✅ Full        Count of YES answers: 0=clinic,
                                                                  1=hospital, 2-3=trauma.

  Pass severity param to Logic      P1             ✅ Full        Route:
  Emergency screen                                                /emergency?type=MEDICAL&severity=trauma

  Show correct service   Logic      P1             ✅ Full        Clinic / Hospital Emergency / Trauma
  label per severity                                              Centre.
  ---------------------- ---------- -------------- -------------- -----------------------------------------

**Screen 7 --- Emergency Screen (Medical Mode)**

  ---------------------- ---------- -------------- -------------- -----------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Golden Hour Timer ---  UI / Logic P1             ✅ Full        Large red numbers. Top strip.
  60:00 countdown                                                 Always visible. Starts on
                                                                  mount.

  Timer turns bright red UI         P1             ✅ Full        Colour change + subtle pulse
  under 30:00                                                     animation at 30 min.

  Timer persists in      Logic      P2             ✅ Full        If user leaves and returns,
  AsyncStorage                                                    timer continues from saved
                                                                  time.

  Location bar: place    UI         P1             ⚠️ Partial     Reverse geocoded name.
  name                                                            \'Enter km marker\' link
                                                                  below.

  Auto-call banner       UI / Logic P1             ✅ Full        Blue banner: \'Calling
  (trauma only)                                                   ambulance --- 108\'. Shows
                                                                  for severity=trauma.

  Auto-dial on trauma    Logic      P1             ✅ Full        Automatically opens phone
  severity                                                        dialler with ambulance
                                                                  number.

  Results list: trauma   UI / Logic P1             ⚠️ Partial     Filtered by severity.
  centres / hospitals /                                           Overpass query with correct
  clinics                                                         amenity tag.

  Result card: name      UI         P1             ✅ Full        Bold. First line of card.

  Result card: distance  UI         P1             ✅ Full        E.g. \'2.1 km away\'.
  in km                                                           Calculated from GPS.

  Result card: phone     UI         P1             ✅ Full        Shown if available from
  number                                                          Overpass tags.

  Result card: \'Call\'  UI / Logic P1             ✅ Full        Opens native phone dialler
  button                                                          with number.

  Result card:           UI / Logic P1             ✅ Full        Opens Google Maps with
  \'Navigate\' button                                             destination lat/lng.

  \'Offline data\' badge UI         P1             ✅ Full        Shown when data served from
  on cards                                                        local DB not Overpass.

  Police card (always    UI         P1             ✅ Full        Below hospital results. Same
  shown)                                                          card style.

  Petrol pump card with  UI / Logic P1             ✅ Full        Nearest pump shown. Green
  \'Alerted\' tag                                                 \'Alerted\' badge after ERP
                                                                  alert sent.

  First Aid Steps        UI         P1             ✅ Full        Collapsible accordion. Open
  section                                                         by default. Steps as numbered
                                                                  list.

  3 first aid steps      UI         P1             ✅ Full        Don\'t move. Keep warm. Tilt
  (content)                                                       head if unconscious.

  \'Alert Family\'       UI / Logic P1             ⚠️ Partial     Sends SMS to saved contacts
  button                                                          with location link. One-tap.

  \'Share Incident\'     UI / Logic P2             ⚠️ Partial     Copies
  button                                                          roadsos.app/incident/\[id\]
                                                                  to clipboard. Creates
                                                                  Firebase record.

  \'I\'m a bystander     UI         P1             ✅ Full        Ghost link at bottom. →
  here\' link                                                     Bystander confirm screen.

  Screen keep-awake      Logic      P1             ✅ Full        expo-keep-awake activated on
  active                                                          mount, deactivated on
                                                                  unmount.

  Haptic on SOS trigger  Logic      P1             ✅ Full        expo-haptics heavy impact on
                                                                  screen entry.
  ---------------------- ---------- -------------- -------------- -----------------------------

  -----------------------------------------------------------------------
  **🔥 FIRE FLOW**

  -----------------------------------------------------------------------

**Screen 8 --- Evacuation Guide**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Full-screen orange     UI         P1             ✅ Full        No navigation
  background                                                      chrome. Immersive
                                                                  emergency mode.

  90-second countdown at UI / Logic P1             ✅ Full        Counts down from 90.
  top                                                             Large white numbers.

  Step 1: TURN OFF       UI         P1             ✅ Full        Large bold text.
  IGNITION                                                        Icon. White on
                                                                  orange.

  Step 2: GET EVERYONE   UI         P1             ✅ Full        Auto-shown after 15s
  OUT                                                             or user tap.

  Step 3: DO NOT open    UI         P1             ✅ Full        Red warning style
  bonnet                                                          within orange
                                                                  screen.

  Step 4: Call 101 (fire UI         P1             ✅ Full        Large number.
  brigade)                                                        Country-resolved.
                                                                  Tap to call.

  Auto-advance steps     Logic      P1             ✅ Full        Or user taps \'Done,
  every 15 seconds                                                next step\'.

  \'Done, next step\'    UI         P1             ✅ Full        Manual advance.
  button                                                          White outlined
                                                                  button.

  \'Show nearby fire     UI         P1             ✅ Full        Always visible at
  brigade\' persistent                                            bottom. → Emergency
  button                                                          (fire mode).

  Auto-navigate to       Logic      P1             ✅ Full        Timer ends →
  Emergency after 90s                                             navigate
                                                                  automatically.
  ---------------------- ---------- -------------- -------------- --------------------

**Screen 9 --- Emergency Screen (Fire Mode)**

  ---------------------- ---------- -------------- -------------- -----------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  \'Fire Emergency\'     UI         P1             ✅ Full        Orange accent colour
  orange header                                                   throughout screen.

  Fire brigade as first  Logic      P1             ⚠️ Partial     Overpass
  result                                                          amenity=fire_station.
                                                                  Country number shown if
                                                                  no result.

  \'DO NOT use water on  UI         P1             ✅ Full        Red card. Always
  fuel fires\' warning                                            visible. Cannot be
  card                                                            dismissed.

  Nearest petrol pump    UI         P1             ✅ Full        Pump card with \'May
  with extinguisher note                                          have extinguisher\'
                                                                  tag.

  Police card for        UI         P1             ✅ Full        Below fire results.
  traffic management                                              

  \'Alert Family\'       UI / Logic P1             ⚠️ Partial     Same as medical screen.
  button                                                          

  Back → Evacuation      Logic      P1             ✅ Full        Back arrow returns to
  Guide (not Home)                                                steps, not to home.
  ---------------------- ---------- -------------- -------------- -----------------------

  -----------------------------------------------------------------------
  **🔧 BREAKDOWN & FUEL FLOW**

  -----------------------------------------------------------------------

**Screen 10 --- Breakdown Screen**

  ---------------------- ---------- -------------- -------------- ---------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Tab bar: Towing ·      UI         P1             ✅ Full        Horizontal tab bar. Active
  Puncture · Petrol                                               tab = blue underline.
  Pumps · Showrooms                                               

  Default tab: Towing    Logic      P1             ✅ Full        Param passed from Home
  (Breakdown) / Petrol                                            screen determines default
  Pumps (Fuel)                                                    tab.

  Results list per tab   UI / Logic P1             ⚠️ Partial     Overpass query changes per
                                                                  tab. Refresh on tab switch.

  Result card: Name +    UI         P1             ✅ Full        Same card component as
  Distance + Phone                                                Emergency screen.

  \'Open Now\' green     UI / Logic P2             ❌ Requires    Check Overpass
  badge on card                                    internet       opening_hours tag. Show
                                                                  badge if currently open.

  \'Closed\' grey badge  UI         P2             ❌ Requires    When opening_hours
  on card                                          internet       indicates closed.

  \'Show closed\' toggle UI         P2             ✅ Full        Top-right toggle. Default =
                                                                  show open only.

  \'Call\' button per    UI / Logic P1             ✅ Full        Native dial.
  card                                                            

  \'Navigate\' button    UI / Logic P1             ✅ Full        Google Maps deep link.
  per card                                                        

  Max 5 results per tab  Logic      P1             ✅ Full        Limit Overpass response.

  Sort by distance       Logic      P1             ✅ Full        Calculate distance. Sort
  ascending                                                       array before render.

  \'Petrol pump          UI / Logic P1             ✅ Full        Small green banner at top.
  alerted\' banner                                                Appears once pump ERP alert
                                                                  sent.

  Pull-to-refresh        UI / Logic P2             ⚠️ Partial     RefreshControl. Re-fetches
                                                                  if online. Shows cached if
                                                                  offline.

  Overpass query per tab Logic      P1             ⚠️ Partial     Towing=car_repair,
                                                                  Puncture=tyres, Pumps=fuel,
                                                                  Showrooms=car_dealership.
  ---------------------- ---------- -------------- -------------- ---------------------------

  -----------------------------------------------------------------------
  **🌊 FLOOD FLOW**

  -----------------------------------------------------------------------

**Screen 11 --- Emergency Screen (Flood Mode)**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  \'DO NOT drive through UI         P1             ✅ Full        Teal/red warning.
  water\' warning banner                                          Top of screen.
                                                                  Always visible.

  NDRF contact card:     UI         P1             ✅ Full        Prominent. Tap to
  1078                                                            call.
                                                                  Country-resolved.

  Police card            UI         P1             ✅ Full        Standard card. 100
                                                                  or country number.

  Nearest hospital card  UI         P1             ⚠️ Partial     Overpass query.
                                                                  Offline fallback.

  Nearest petrol pump as UI         P1             ✅ Full        Card labelled
  shelter point                                                   \'Possible
                                                                  shelter\'. ERP
                                                                  alerted.

  \'Navigate to safe     UI / Logic P2             ❌ Requires    Google Maps link to
  ground\' button                                  internet       highest elevation
                                                                  nearby. Placeholder
                                                                  if offline.

  \'Alert Family\'       UI / Logic P1             ⚠️ Partial     SMS with location.
  button                                                          
  ---------------------- ---------- -------------- -------------- --------------------

  -----------------------------------------------------------------------
  **🚨 CRIME FLOW**

  -----------------------------------------------------------------------

**Screen 12 --- Silent SOS Screen**

  ---------------------- ---------- -------------- -------------- ------------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Dims screen to \~5%    Logic      P1             ✅ Full        expo-brightness or
  brightness on entry                                             react-native-brightness. Set
                                                                  to 0.05.

  No sound. No vibration Logic      P1             ✅ Full        Explicitly cancel any pending
  on entry.                                                       vibrations.

  Screen appears nearly  UI         P1             ✅ Full        Black background. No visible
  black                                                           UI elements to casual
                                                                  observer.

  Disable Android back   Logic      P1             ✅ Full        BackHandler.addEventListener
  gesture                                                         returns true (intercepts
                                                                  back).

  Disable bottom         UI         P1             ✅ Full        Hide bottom tab bar
  navigation on this                                              completely.
  screen                                                          

  Hidden 3x-tap cancel   Logic      P1             ✅ Full        Invisible Pressable covering
  zone (bottom-right)                                             bottom-right 80x80dp area. 3
                                                                  taps = cancel.

  GPS location sent to   Logic      P1             ⚠️ Partial     Background interval. Updates
  Firebase every 60s                                              Firebase incident record.

  SMS sent to nearest    Logic      P1             ⚠️ Partial     Overpass police query. SMS
  police station                                                  with \'I need help\' +
                                                                  location link.

  SMS sent to saved      Logic      P1             ⚠️ Partial     Same SMS to contacts. Silent
  emergency contacts                                              --- no toast or confirmation.

  Firebase incident      Logic      P2             ⚠️ Partial     Marked private. No public
  created with                                                    incident link.
  type=CRIME                                                      

  Cancel SOS: restore    Logic      P1             ✅ Full        On 3x tap: expo-brightness
  brightness + navigate                                           restore, navigate to Home.
  Home                                                            
  ---------------------- ---------- -------------- -------------- ------------------------------

  -----------------------------------------------------------------------
  **👥 BYSTANDER FLOW**

  -----------------------------------------------------------------------

**Screen 13 --- Bystander Confirm Screen**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  \'You\'re at an        UI         P1             ✅ Full        Green header. Calm,
  accident scene\'                                                directive tone.
  header                                                          

  Current location       UI         P1             ⚠️ Partial     Shows GPS-resolved
  confirmed                                                       place name. Spinner
                                                                  while fetching.

  \'Yes, I\'m at the     UI / Logic P1             ✅ Full        Green. Full width. →
  scene\' primary button                                          check Firebase for
                                                                  nearby incidents.

  Firebase nearby        Logic      P1             ⚠️ Partial     Query incidents
  incident check                                                  within 200m. Created
                                                                  in last 2 minutes.

  Route: incident found  Logic      P1             ⚠️ Partial     Merge into existing
  → Role Assignment                                               incident.

  Route: no incident →   Logic      P1             ✅ Full        Start new bystander
  Bystander Guidance                                              flow without
                                                                  incident merge.

  Loading state while    UI         P2             ⚠️ Partial     Skeleton or spinner.
  checking Firebase                                               Max 3s timeout then
                                                                  route to guidance.
  ---------------------- ---------- -------------- -------------- --------------------

**Screen 14 --- Role Assignment Screen**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Incident ID +          UI         P1             ⚠️ Partial     From Firebase. E.g.
  responder count header                                          \'Incident #XK29 ---
                                                                  3 people helping\'.

  User\'s assigned role  UI         P1             ⚠️ Partial     Role icon + role
  --- large card                                                  name + short
                                                                  instruction. Green
                                                                  card.

  Other roles shown as   UI         P1             ⚠️ Partial     Greyed cards showing
  taken (greyed)                                                  other responders\'
                                                                  roles.

  \'Start my role\'      UI / Logic P1             ✅ Full        → Bystander Guidance
  button                                                          screen with role
                                                                  param.

  \'Swap role\' button   UI / Logic P2             ⚠️ Partial     Shows available
                                                                  unassigned roles.
                                                                  User can choose
                                                                  different role.

  Live responder count   Logic      P2             ⚠️ Partial     onValue listener.
  (Firebase listener)                                             Updates count if
                                                                  more people join.
  ---------------------- ---------- -------------- -------------- --------------------

**Screen 15 --- Bystander Guidance Screen**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Role label at top      UI         P1             ✅ Full        E.g. \'🩺 Your role:
                                                                  Stay with injured
                                                                  person\'.

  Numbered step list     UI         P1             ✅ Full        5-6 steps per role.
                                                                  Large text. One step
                                                                  highlighted at a
                                                                  time.

  \'Mark as done\' on    UI / Logic P1             ✅ Full        Tap → green tick.
  each step                                                       Next step
                                                                  highlights. No going
                                                                  back.

  Steps content: Stay    UI         P1             ✅ Full        5 first-aid steps.
  with victim role                                                Localised.

  Steps content: Call    UI         P1             ✅ Full        Dials ambulance +
  ambulance role                                                  confirms called in
                                                                  Firebase.

  Steps content: Direct  UI         P1             ✅ Full        Safety instructions
  traffic role                                                    for traffic
                                                                  management.

  Steps content: Flag    UI         P1             ✅ Full        Where to stand, how
  ambulance role                                                  to signal.

  Live ambulance ETA     UI / Logic P2             ⚠️ Partial     Shows \'Ambulance
  strip (bottom)                                                  ETA: \~8 min\' from
                                                                  Firebase estimate.

  \'Ambulance has        UI / Logic P1             ⚠️ Partial     Marks incident
  arrived\' button                                                resolved in
                                                                  Firebase. Ends
                                                                  session.

  All steps done state   UI         P1             ✅ Full        Show \'You\'ve done
                                                                  everything you can.
                                                                  Help is coming.\'
                                                                  message.
  ---------------------- ---------- -------------- -------------- --------------------

  -----------------------------------------------------------------------
  **🆔 MEDICAL QR ID FLOW**

  -----------------------------------------------------------------------

**Screen 16 --- Medical QR ID Screen**

  ---------------------- ---------- -------------- -------------- --------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Display current        UI         P1             ✅ Full        Blood group · Allergies ·
  medical info                                                    Medications · Emergency
                                                                  contact. Read from
                                                                  AsyncStorage.

  QR code displayed      UI         P1             ✅ Full        react-native-qrcode-svg.
  centred (large)                                                 Encodes JSON of medical
                                                                  data.

  QR generated entirely  Logic      P1             ✅ Full        No API call. Pure local
  offline                                                         SVG generation.

  \'Screenshot and set   UI         P1             ✅ Full        Instructional text below
  as lock screen\'                                                QR.
  instruction                                                     

  \'Edit info\' link     UI         P1             ✅ Full        Opens inline editable
                                                                  form. QR regenerates on
                                                                  save.

  \'Download QR\' button UI / Logic P2             ✅ Full        Saves QR as PNG to
                                                                  gallery.
                                                                  expo-media-library.

  \'Share\' button       UI / Logic P2             ✅ Full        Native share sheet. Share
                                                                  QR image.

  Empty state if no      UI         P1             ✅ Full        \'Set up your Medical ID\'
  medical info set                                                CTA card. → Setup screen.

  QR re-generates when   Logic      P1             ✅ Full        useEffect dependency on
  info is edited                                                  medical data.
  ---------------------- ---------- -------------- -------------- --------------------------

  -----------------------------------------------------------------------
  **⏱️ SAFE ARRIVAL TIMER FLOW**

  -----------------------------------------------------------------------

**Screen 17 --- Safe Arrival Setup Screen**

  ---------------------- ---------- -------------- -------------- --------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  \'Going on a long      UI         P1             ✅ Full        Amber accent.
  drive?\' header                                                 Friendly tone.

  Destination name field UI         P1             ✅ Full        Free text. e.g.
                                                                  \'Mumbai\'.
                                                                  Keyboard: default.

  Expected arrival time  UI         P1             ✅ Full        Time picker.
  picker                                                          DateTimePicker or
                                                                  custom wheel picker.

  Contacts to alert      UI         P1             ✅ Full        Shows saved
  section                                                         emergency contacts.
                                                                  Pre-selected.
                                                                  Toggleable.

  \'Start timer\' button UI / Logic P1             ✅ Full        Writes deadline to
                                                                  AsyncStorage.
                                                                  Navigates to Home.

  Persistent \'Safe      UI / Logic P1             ✅ Full        Yellow bar. Shows
  arrival active\'                                                destination + ETA.
  banner on Home                                                  Tap = check-in.

  \'I arrived safely\'   Logic      P1             ✅ Full        Clears deadline from
  check-in tap on banner                                          AsyncStorage.
                                                                  Removes banner.

  Auto-SMS if deadline   Logic      P1             ✅ Full        On app foreground:
  missed                                                          check if Date.now()
                                                                  \> deadline+15min.
                                                                  Send SMS.

  SMS content            Logic      P1             ⚠️ Partial     \[Name\] hasn\'t
                                                                  checked in. Last
                                                                  location: \[link\].
                                                                  Sent to all selected
                                                                  contacts.

  Active timer can be    UI / Logic P2             ✅ Full        If timer active,
  cancelled from setup                                            show \'Active ---
  screen                                                          cancel?\' instead of
                                                                  start form.
  ---------------------- ---------- -------------- -------------- --------------------

  -----------------------------------------------------------------------
  **📍 KM MARKER INPUT --- Cross-screen Modal**

  -----------------------------------------------------------------------

**Screen 18 --- KM Marker Input (Bottom Sheet Modal)**

  ---------------------- ---------- -------------- -------------- ---------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  \'Enter km marker\'    UI         P1             ✅ Full        Small grey link below
  link on Emergency +                                             location bar on relevant
  Breakdown screens                                               screens.

  Bottom sheet modal on  UI         P1             ✅ Full        Slide-up modal.
  tap                                                             react-native-bottom-sheet
                                                                  or custom.

  Highway name field     UI         P1             ✅ Full        Text input. e.g. \'NH-48\'.

  KM number field        UI         P1             ✅ Full        Numeric keyboard. e.g.
                                                                  \'142\'.

  Auto-complete highway  UI / Logic P2             ✅ Full        As user types, suggest
  suggestions                                                     matching highways from
                                                                  offline DB keys.

  \'Find services here\' UI / Logic P1             ✅ Full        Resolves km marker from
  button                                                          offline DB JSON.

  On resolve: update     Logic      P1             ✅ Full        Callback prop updates
  parent screen location                                          location state. Triggers
                                                                  new Overpass query.

  Not found fallback     Logic      P1             ⚠️ Partial     If km key not in DB: show
                                                                  \'Using approximate
                                                                  location\' and use highway
                                                                  midpoint GPS.

  Modal closes on        Logic      P1             ✅ Full        Auto-dismiss after 500ms on
  successful resolve                                              success.
  ---------------------- ---------- -------------- -------------- ---------------------------

  -----------------------------------------------------------------------
  **🗺️ INCIDENT MAP --- Shareable Live Screen**

  -----------------------------------------------------------------------

**Screen 19 --- Incident Map Screen**

  ---------------------- ---------- -------------- -------------- -----------------------------
  **Feature**            **Type**   **Priority**   **Offline?**   **Notes**

  Map centred on         UI         P1             ❌ Requires    react-native-maps with
  incident location                                internet       OpenStreetMap tiles.

  Incident pin on map    UI         P1             ❌ Requires    Custom red pin at incident
                                                   internet       lat/lng.

  Live status cards from UI / Logic P2             ⚠️ Partial     onValue listener. Real-time
  Firebase                                                        updates.

  Status card: Ambulance UI         P2             ⚠️ Partial     Green check + timestamp.
  called                                                          

  Status card: Family    UI         P2             ⚠️ Partial     Green check + timestamp.
  alerted                                                         

  Status card: Police    UI         P2             ⚠️ Partial     Grey clock icon.
  --- not called                                                  

  ETA estimate (distance UI         P2             ✅ Full        Shown as \'\~8 minutes\'.
  ÷ 40 km/h)                                                      Clearly labelled as estimate.

  Responders count       UI         P2             ⚠️ Partial     \'3 people helping at this
                                                                  scene\'. From Firebase
                                                                  responders map.

  \'Mark resolved\'      UI / Logic P2             ⚠️ Partial     Updates Firebase
  button                                                          status=resolved. Stops timer.

  \'Share link\' button  UI         P2             ✅ Full        Copies
                                                                  roadsos.app/incident/\[id\]
                                                                  to clipboard. Share sheet.
  ---------------------- ---------- -------------- -------------- -----------------------------

**Section 3 --- Reusable UI Component Library**

Build these components once. Use everywhere. Do not duplicate logic
across screens.

  ------------------- ------------------- --------------------------------- ------------------
  **Component name**  **Used on screens** **Props / Config**                **Notes**

  EmergencyCard       Emergency ·         name, distance, phone, onCall,    Primary result
                      Breakdown · Flood   onNavigate, isOffline             card. Shows call +
                                                                            navigate buttons.

  GoldenHourTimer     Emergency (medical) startTime, onExpire               Countdown from
                                                                            60:00. Colour
                                                                            change at 30 min.
                                                                            Persisted.

  OfflineDot          All screens (top    status:                           Green/orange/red
                      bar)                \'live\'\|\'offline\'\|\'none\'   dot with label.

  LocationBar         Emergency ·         placeName, onKmMarkerPress        Shows place name.
                      Breakdown                                             KM marker link
                                                                            below.

  AlertFamilyButton   Emergency ·         contacts, locationLink            Sends SMS to all
                      Breakdown · Flood                                     saved contacts.
                                                                            Confirmation
                                                                            toast.

  FirstAidSteps       Emergency (medical) severity, role                    Collapsible
                                                                            accordion. Steps
                                                                            based on severity.

  PermissionRow       Permissions screen  type, status, onPress             Icon + label +
                                                                            status badge.
                                                                            Reused for 3
                                                                            permissions.

  ContactCard         Setup screen        index, onImport, onRemove         Name + phone
                                                                            fields + trash
                                                                            icon. Max 3
                                                                            instances.

  ResultTab           Breakdown screen    tabs, activeTab, onTabChange      Horizontal tab
                                                                            bar. Handles tab
                                                                            switching.

  EvacuationStep      Evacuation Guide    step, isActive, onDone            Single step
                                                                            display. Auto or
                                                                            manual advance.

  KmMarkerModal       Emergency ·         onResolve, onClose                Bottom sheet.
                      Breakdown                                             Highway + km
                                                                            inputs. Offline
                                                                            lookup.

  RoleCard            Role Assignment     role, isMine, isTaken             Shows role icon,
                                                                            title,
                                                                            description. Green
                                                                            if mine, grey if
                                                                            taken.

  GuidanceStep        Bystander Guidance  step, isDone, onMarkDone          Numbered step.
                                                                            Checkbox on right.
                                                                            Green when done.

  PumpAlertBanner     Emergency ·         pumpName, distance                Green top banner.
                      Breakdown                                             \'Petrol pump
                                                                            \[X\] alerted\'.

  SafeArrivalBanner   Home screen         destination, eta, onCheckIn       Amber bottom
                                                                            banner. Tap to
                                                                            check in.

  SilentTapZone       Silent SOS          onTripleTap                       Invisible
                                                                            Pressable. Counts
                                                                            3 taps within 2
                                                                            seconds.
  ------------------- ------------------- --------------------------------- ------------------

**Section 4 --- Libraries, Permissions & Storage**

**4.1 Required Libraries**

  -------------------------------------------- -------------------------------------------- ---------------------------
  **Library**                                  **Install command**                          **Used for**

  expo-location                                expo install expo-location                   GPS coordinates on
                                                                                            Emergency + Breakdown
                                                                                            screens.

  expo-sms                                     expo install expo-sms                        Family alert SMS + silent
                                                                                            crime SMS.

  expo-contacts                                expo install expo-contacts                   Import contacts in Setup
                                                                                            screen.

  expo-brightness                              expo install expo-brightness                 Dim screen on Silent SOS
                                                                                            entry/exit.

  expo-keep-awake                              expo install expo-keep-awake                 Screen stays on during
                                                                                            active Emergency screen.

  expo-media-library                           expo install expo-media-library              Save QR code to gallery.

  expo-sharing                                 expo install expo-sharing                    Share QR image via native
                                                                                            share sheet.

  expo-haptics                                 expo install expo-haptics                    Vibration on SOS trigger.
                                                                                            Heavy impact.

  \@react-native-async-storage/async-storage   npm install                                  All persistent local
                                               \@react-native-async-storage/async-storage   storage (contacts,
                                                                                            settings, offline DB,
                                                                                            timers).

  react-native-qrcode-svg                      npm install react-native-qrcode-svg          Generate Medical QR ID
                                                                                            offline.

  react-native-maps                            expo install react-native-maps               Incident map screen.
                                                                                            OpenStreetMap tiles.

  \@react-navigation/native                    npm install \@react-navigation/native        Screen navigation. Stack +
                                                                                            bottom tabs.

  \@react-navigation/bottom-tabs               npm install \@react-navigation/bottom-tabs   4-tab bottom navigation
                                                                                            bar.

  \@gorhom/bottom-sheet                        npm install \@gorhom/bottom-sheet            KM Marker modal. Bystander
                                                                                            entry slide-up.

  firebase                                     npm install firebase                         Incident merge. Pump
                                                                                            alerts. Real-time status.

  i18n-js                                      npm install i18n-js                          Localisation. English /
                                                                                            Hindi / Gujarati strings.
  -------------------------------------------- -------------------------------------------- ---------------------------

**4.2 Permissions Required**

  ------------------------ ---------------------- ----------------------------
  **Permission**           **When needed**        **If denied: behaviour**

  ACCESS_FINE_LOCATION     All Emergency +        Show KM marker input as
                           Breakdown screens      primary option. No GPS
                                                  fallback.

  ACCESS_COARSE_LOCATION   Fallback if fine       Less accurate but
                           denied                 functional.

  READ_CONTACTS            Setup screen ---       Show manual entry only. No
                           import contacts        import button.

  SEND_SMS                 Alert Family + Silent  Show \'Open dialler\' as
                           SOS                    fallback. Cannot auto-send.

  WRITE_EXTERNAL_STORAGE   Save QR to gallery     Hide \'Download QR\' button.
                                                  Show \'Share\' only.

  VIBRATE                  Haptic on SOS trigger  Silent fail. No crash.

  CHANGE_CONFIGURATION     Brightness control     Skip dimming. Still show
                           (Silent SOS)           black screen.
  ------------------------ ---------------------- ----------------------------

**4.3 AsyncStorage Keys Reference**

  --------------------- ------------------------ ------------------ -----------------
  **Key**               **Value type**           **Written by**     **Read by**

  onboardingComplete    boolean                  Onboarding final   Splash screen ---
                                                 slide              routing

  language              \'en\'\|\'hi\'\|\'gu\'   Setup screen       Every screen
                                                                    render (i18n)

  emergencyContacts     JSON array \[{name,      Setup screen       Alert Family,
                        phone}\]                                    Safe Arrival,
                                                                    Crime SMS

  medicalInfo           JSON {blood, allergies,  Setup / Medical QR Medical QR
                        meds}                    screen             generator

  offlineEmergencyDB    JSON --- bundled service Splash screen      All Emergency +
                        data                     (first load)       Breakdown screens

  kmMarkerDB            JSON --- highway km →    Splash screen      KM Marker modal
                        GPS                      (first load)       

  emergencyNumbersDB    JSON --- country →       Splash screen      All call buttons,
                        numbers                  (first load)       country resolver

  safeArrivalDeadline   JSON {deadline,          Safe Arrival setup App foreground
                        destination, contacts}                      check, Home
                                                                    banner

  activeIncidentId      string                   SOS trigger on     Incident Map
                                                 Emergency screen   screen

  goldenHourStart       timestamp number         Emergency          GoldenHourTimer
                                                 (medical) screen   component
                                                 mount              
  --------------------- ------------------------ ------------------ -----------------

**Section 5 --- Recommended Build Order**

*Follow this order. Each phase produces a demo-able product. Never be in
a state where nothing works.*

  -------------- ---------- ------------------------------- -----------------------
  **Phase**      **Days**   **Screens / Features**          **Demo-able after**

  1 ---          0.5        App.jsx. Bottom tabs. Stack     Can navigate between
  Navigation                navigator. All screens as empty all screens.
  skeleton                  placeholders.                   

  2 --- Home     1          6 buttons with correct colours, Can tap any button.
  screen                    icons, labels. Navigation to    Correct screen opens.
                            correct screen per button.      
                            Language toggle.                

  3 ---          1.5        Location fetch. Overpass call.  Live demo: show nearest
  Emergency                 Result cards with Call +        hospital with call
  screen (core)             Navigate. Offline fallback.     button.
                            Golden hour timer.              

  4 --- Triage   0.5        3 questions. YES/NO buttons.    Full medical flow:
  screen                    Severity routing logic. Pass    Triage → Emergency.
                            param to Emergency screen.      

  5 ---          1          4 tabs. Overpass queries per    Full breakdown flow.
  Breakdown                 tab. Result cards. Open/closed  
  screen                    filter. Offline fallback.       

  6 --- Alert    0.5        AsyncStorage contacts read. SMS Family alert button
  Family + SMS              send via expo-sms. Confirmation works end-to-end.
                            toast.                          

  7 --- Medical  0.5        Read AsyncStorage medical info. QR generated offline.
  QR screen                 Generate QR with                Scan demo works.
                            react-native-qrcode-svg.        
                            Download + share.               

  8 ---          1          3-slide onboarding. Permission  First-launch flow
  Onboarding +              requests. Setup form.           complete.
  Setup +                   AsyncStorage write/read.        
  Permissions                                               

  9 ---          0.5        Steps with auto-advance. 90s    Fire flow complete.
  Evacuation                timer. → Emergency (fire mode). 
  Guide (fire)                                              

  10 ---         1          Confirm screen. Firebase        Bystander flow works
  Bystander flow            incident check. Role            (needs Firebase).
                            assignment. Guidance steps with 
                            mark-done.                      

  11 --- Silent  0.5        Dim screen. Disable back.       Crime flow complete.
  SOS                       Hidden 3x tap zone. SMS to      
                            contacts. Firebase incident.    

  12 --- Safe    0.5        Setup form. AsyncStorage        Safe arrival demo
  Arrival timer             deadline. Home banner.          works.
                            Foreground check. Auto-SMS.     

  13 --- KM      0.5        Bottom sheet. Highway + km      Works without GPS demo.
  Marker modal              input. Offline DB lookup.       
                            Update parent location.         

  14 ---         1          Firebase real-time listener.    Full incident
  Incident Map              Map with pin. Status cards.     coordination demo.
                            Share link.                     

  15 ---         1          Button press animations.        Production-quality
  Polish +                  Loading states. Toast           feel.
  animations                notifications. Edge cases.      
  -------------- ---------- ------------------------------- -----------------------

+-----------------------------------------------------------------------+
| Total estimated build time: \~12 development days                     |
|                                                                       |
| P1 features only (minimum viable demo): \~8 days                      |
|                                                                       |
| Phases 1--9 give you a complete, demo-able product for the hackathon. |
|                                                                       |
| Phases 10--15 are the differentiators that separate you from every    |
| other team.                                                           |
+-----------------------------------------------------------------------+
