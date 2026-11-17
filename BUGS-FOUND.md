# Problems found while redesigning, left alone

These are faults in how the app behaves, not in how it looks. None of them has been touched, so
the app still does exactly what it did before. Tell me which you want fixed and I will do them as
a separate job.

## Links that go nowhere

**1. The Calculator link in the desktop menu is dead.**
When you are logged in, the Calculator link in the top navigation points at `/rwh-eligi`. No such
page exists. The catch-all route quietly sends you back to the homepage instead, so it looks like
the click did nothing. The same link in the phone menu points at `/calculator` and works.
`src/components/Header/Header.tsx:57`

**2. All three footer links go to the wrong place.**
Features, About Us and Contact all point at `/home`. That is a logged-in-only page, so a visitor
who is not signed in gets bounced to the login screen. Signed in, all three land on the same page,
and none of them reaches the section named on the link.
`src/components/Footer/Footer.tsx`

**3. Bad addresses fail silently.**
Any unknown address redirects to the homepage without a word. That is what hides problems 1 and 2.
A short "page not found" screen would surface this class of fault instead of swallowing it.
`src/App.tsx`

## Calculations and data

**4. The report can show stale figures.**
The effect that recalculates every figure does not list `calculateAllMetrics` among the things it
watches. If the underlying data changes without that effect re-running, the page keeps showing the
previous numbers. The build already warns about this.
`src/components/Report/Report.tsx:540`

**5. Half-wired consumption logic.**
In the consumption calculator, `indianTariffRates`, `userCoords`, `userRegion`, `isIndia`,
`PER_PERSON_CONSUMPTION` and `watchedOccupants` are all set up and then never used. Reading it, the
intent was to pick the tariff from the user's location and adjust consumption by the number of
people in the house. Neither appears to happen, which means the number of occupants you enter may
not affect the result at all. Worth checking against what you expect.
`src/components/ConsumptionCalculator/ConsumptionCalculator.tsx`

**6. A computed total that is never shown.**
`totalPayment` is worked out in the report and then not displayed anywhere. Either it belongs on
the page beside the EMI figures, or it should go.
`src/components/Report/Report.tsx:347`

## Dead configuration

**7. Tailwind is installed but does nothing.**
`tailwind.config.js` has an empty `content` array and no stylesheet in the project contains the
`@tailwind` directives. No Tailwind class anywhere in the project produces any styling. If some
component was written expecting Tailwind, it is rendering unstyled right now. The redesign uses
plain CSS, so nothing here depends on it, but the dependency is dead weight either way.

## States that strand the user

**8. The dashboard can sit on "Loading..." forever.**
If the signed-in user has no matching document in Firestore, or the read fails, the dashboard
shows a bare "Loading..." and never moves off it. There is no error state and no retry. The error
goes to the browser console, where a user will not see it.
`src/components/Dashboard/Dashboard.tsx`

## Still carrying emoji

**9. The signed-in home page uses emoji as icons.**
`LoggedInHome` uses emoji for its feature and journey cards. This is on the list to replace with
proper icons when that page is redesigned, and is noted here only so it is not forgotten.
`src/components/LoggedInHome/LoggedInHome.tsx`
