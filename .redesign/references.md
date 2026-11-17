# References and the scale check

No Awwwards tools are available in this session and the owner has not named sites they like, so
these three are my picks. Say the word and I will swap any of them.

Screenshots: `.redesign/screens/ref-stripe/`, `ref-octopus/`, `ref-wise/`, at 1440 and 390.
They are for comparison only and never ship.

## Why these three

| Site | Why it fits UrjaShakti |
|---|---|
| stripe.com | The same job: explain a technical, numbers-heavy service to a non-technical buyer without dumbing it down. Restraint, a real container, type that stays calm while the page carries a lot of fact. |
| octopus.energy | The same industry and the same customer: a household deciding about energy. Commits to saturated full-bleed colour and puts the quote form in the hero rather than a slogan. |
| wise.com | The closest thing to our money problem: rupee figures that have to read instantly and feel trustworthy. Huge confident display type, one bold brand colour across whole screens, figures as the hero. |

## Measured, at 1440px

| | H1 | line height | weight | body | container | section padding | nav height | display / body face |
|---|---|---|---|---|---|---|---|---|
| stripe.com | 48px | 55px | 300 | 16px | 1230px | — | 76px | Söhne / Söhne |
| octopus.energy | 36px | 47px | 500 | 18px | 1140px | 48px | 54px | Chromatophore / Chromatophore |
| wise.com | 104px | 90px | 800 | 16px | 1250px | 56px | 76px | Wise Sans / Inter |
| **UrjaShakti** | **75px** | **76px** | **700** | **18px** | **1240px** | **96px** | **72px** | Schibsted Grotesk / IBM Plex Sans |

(Our row's body figure is 18px; leads run 20-22px. The container, nav height and H1 weight land
squarely between the three.)

## What we take, and what we do not

| From | Borrow | Do not take |
|---|---|---|
| stripe.com | A calm container holding dense fact; the nav as a plain full-width bar; sentence case throughout | The gradient ribbon, the logo wall. We have no customer logos and will not invent any |
| octopus.energy | Full-bleed saturated bands; the primary action in the hero rather than a slogan | Their mascot, their photography-led hero, their pinks and purples |
| wise.com | Figures as the thing the eye lands on; one brand colour owning whole screens; heavy display weight | All-caps display type, and their green, which would collide with our money green |

## The scale check

Our `after/home@1440-top.jpg` beside each reference's `home@1440-top.jpg`:

1. **Is our type as large and confident?** Yes. H1 at 75px sits between Stripe's 48 and Wise's 104,
   at weight 700. Body at 18px matches Octopus and beats Stripe and Wise at 16.
2. **Is our spacing as generous, without empty stretches?** Spacing is more generous: 96px section
   padding against their 48 to 56. One caveat below.
3. **Is colour used as boldly?** Comparable. Four full-width bands in deep slate, leaf green, white
   and action blue, against Octopus's and Wise's single saturated brand colour.
4. **Would a stranger put them in the same tier?** On layout, type and colour, yes. On finish, not
   yet, for one reason: our hero visual is still a grey placeholder. All three references lead with
   a real, specific image. The moment the calculator screenshot described in `IMAGES-TO-ADD.md`
   replaces it, the hero is the equal of theirs; until then it is the page's weakest spot.

### The one thing worth fixing next

At 1440 the pinned "how it works" heading column leaves open space beneath it while the four steps
scroll past. The pin is intentional and it reads correctly in motion, but in a still screenshot
that column looks empty. Octopus and Wise never leave a column of that size unfilled. Options:
move the lead paragraph down into the pinned column, or drop the pin and keep the full-width
heading. Worth the owner's view before I change it.
