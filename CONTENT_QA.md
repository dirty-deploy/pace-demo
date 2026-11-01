# Content QA: VARC answer keys and vocabulary

This is the separate second pass that section 9.1 of `V2_SPEC.md` asks for.

- **Who:** Claude, acting as a reviewer who did not write this content.
- **Date:** 2026-11-01
- **Scope:** `src/content/varc/passages.ts`, `src/content/varc/verbal.ts`, `src/content/vocab.ts`, `src/content/vocabPractice.ts`.

**Method.** For each of the 48 VARC items I worked out the answer from the text, justified the key in one line, tried to defend each wrong option, and checked the explanation and trap label. For para-jumbles I looked for a second order that reads well. For odd-sentence-out I asked whether another sentence could be the odd one. Then I fact-checked the passages and dated sentences, reviewed the vocabulary, and ran a small script over all the content.

**One limit you should know about.** The brief asked me to answer each question before seeing its key. The files store the key beside each question and I read them whole, so the keys were in view. My worked answer agreed with the key on all 48, but this was not a blind solve, so that agreement is weaker evidence than it sounds. See open doubt 1.

**Result.** 48 items: 36 Pass, 12 Fixed, 0 Replaced. No key changed.

## Item log

Key letters are A to D in printed order. "Item unchanged" means the question text did not change, even if a passage sentence near it did.

| ID | Type | Key | Justification | Distractors check | Status |
|---|---|---|---|---|---|
| RC1-1 | RC, main idea | B | Opens on "an answer to the problem of exorbitant rent"; closes on how cheaply someone can try their luck. | OK. C fails: drains are called overdue, so not all regulation is the worry. | Pass |
| RC1-2 | RC, inference | D | Last paragraph: the measure is how cheaply a person with little capital can try. | OK. A fails: the author says the measure is "not how authentic it feels". | Pass |
| RC1-3 | RC, detail | A | Third paragraph: the crowd is something "none could produce alone". | OK. C fails: they cooperate "without ever discussing it", and prices are never mentioned. | Pass |
| RC1-4 | RC, weaken | C | Trust comes from kitchen, queue and reputation. Buyers who ignore all three cut that link. | OK. B fails: the author already concedes that none of this guarantees safety. | Pass |
| RC2-1 | RC, main idea | C | Most of the passage is the process; the last paragraph tests the lesson for people. | Correct option was 3 words longer than the rest, so I trimmed it. A fails: swarms are never said to beat committees. | Fixed |
| RC2-2 | RC, detail | D | "A follower does not simply copy. She visits the site." | OK. B is true but answers a different question: fading ends loyalty, not imitation. | Pass |
| RC2-3 | RC, inference | A | Fading means "no faction can hold out". Without it, holding out becomes possible. | Key said "slow the decision", which published models do not support (see fact checks). Reworded to "hold out against better ones", which the passage does say. B fails: nothing says a quorum becomes impossible. | Fixed |
| RC2-4 | RC, tone | B | "Some of the transfer is sound", then the limits. | OK. A fails: the author accepts several practical lessons. | Pass |
| RC3-1 | RC, main idea | D | "A standard does not need to be natural to be fair. It needs only to be shared, stable." | Old key said "not in its claimed origin", but the author says that claim "did real work". Now reads "not in a truly natural origin". Trap label changed to Reversal, since the author rejects A. | Fixed |
| RC3-2 | RC, detail | A | "Nobody altered the bar"; the metre became "simply the length of this one bar". | OK. B fails: it says the opposite. | Pass |
| RC3-3 | RC, inference | B | The loyalty is to the existing length, and the fraction is its trace. | OK. C fails: the loyalty is to the length, not to survey methods. | Pass |
| RC3-4 | RC, application | C | The value stays while the reason behind it is dropped. | OK. D fails: a new scale changes the value, which never happened to the metre. | Pass |
| RC4-1 | RC, inference | A | Rules follow from "the nature of the service": a sailor must trust a light unseen. | OK. C fails: moving keepers is one rule among many. Its source sentence is now hedged with "perhaps"; item unchanged. | Pass |
| RC4-2 | RC, title | C | The tight management, then what went uncounted. | OK. A fails: the author calls that image "largely wrong". | Pass |
| RC4-3 | RC, tone | D | "I am not persuaded", then "Yet something less obvious did disappear." | OK. A fails: the author declines to lament. | Pass |
| RC4-4 | RC, application | B | Needs a saving plus an unrecorded duty lost. Conductors helping frail riders has both. | OK. A fails: a saving with no hidden loss. | Pass |
| RC5-1 | RC, inference | C | "Less the lost time than the insult", the claim that his time counts for more. | OK. A fails: the delay is "a matter of seconds". | Pass |
| RC5-2 | RC, detail | B | The single line "may barely change the average wait" and makes waiting more equal. | Passage and explanation softened (see fact checks). A still fails against the passage. | Fixed |
| RC5-3 | RC, strengthen | D | The lane costs something beyond minutes. People slighted at an unchanged wait shows that. | OK. A fails: money raised is the side the author says can be counted. | Pass |
| RC5-4 | RC, tone | A | Admires the queue, then "An hour is not worth the same to everyone." | OK. B fails: fairer "in one sense", so not a myth. | Pass |
| RC6-1 | RC, main idea | B | "The hand has stopped doing what machines do better and has kept what they do not do at all." | OK. C fails: the studies are explicitly not relied on. | Pass |
| RC6-2 | RC, inference | A | The hand cannot keep up, so the writer must decide what is worth keeping. | OK. B fails: "always" goes beyond one case. | Pass |
| RC6-3 | RC, weaken | C | The account rests on slowness forcing a choice. Random dropping means no choice. | OK. A fails: the author already grants this. | Pass |
| RC6-4 | RC, application | D | The candle lost its main job and kept a special one. Horses do the same. | OK. A fails: killed outright, which the author says is rare. | Pass |
| PJ01 | Para-jumble | 2413 | 2 sets the scene, 4 describes the gap, 1 is the change, 3 the result. | 4213 read acceptably. Sentence 4 now starts "The resulting gap", which needs 2 first. | Fixed |
| PJ02 | Para-jumble | 35142 | Problem, "Their answer", "Those stairs", "those long months", "later". | OK. No second order found. | Pass |
| PJ03 | Para-jumble | 3241 | "Not merely" pairs with "really"; 4 takes the number from 2; 1 points back to 4. | 3214 read just as well. Sentence 1 now starts "That feeling", which needs 4. Explanation also said the shopkeeper is introduced "by name", which was wrong. | Fixed |
| PJ04 | Para-jumble | 41523 | Old method, its risk, safer idea, experiment, legacy. | 41532 was weakly readable. "that choice" became "that discovery", which needs 2. Explanation of the main trap corrected. | Fixed |
| PJ05 | Para-jumble | 3421 | General claim, example, "such clutter", "It follows". | 4321 was weakly readable. Sentence 4 now has "for instance", which needs 3 first. | Fixed |
| PJ06 | Para-jumble | 25413 | Old way, "of this kind", the change, "these containers", the result. | OK. No second order found. | Pass |
| PJ07 | Para-jumble | 4312 | Carriers, schooling, "Instead" replaces written addresses, "the code". | 4132 and 4123 worked, because "very little paperwork" gave "Instead" an anchor. Removed that phrase from 4. | Fixed |
| PJ08 | Para-jumble | 35241 | Swamps, cleared, storms, roots, replanting. | 35421 read just as well. Rewrote 2 and 4 as a question and "The answer", which forces 2-4. | Fixed |
| PJ09 | Para-jumble | 3142 | Claim, "Thus" example, "both sayings", "It shows". | 3421 read well, with "Thus" as a closer. Sentence 4 now starts "That both sayings survive", which needs 1. commonWrong 3412 swapped for 3421. | Fixed |
| PJ10 | Para-jumble | 43152 | 1858, "The rejoicing", 1866, "This time", "that speed". | OK. No second order found. | Pass |
| PS01 | Para-summary | A | Mastery hides the steps, so a recent learner may teach better. | OK. B fails: "the reason is not arrogance". | Pass |
| PS02 | Para-summary | D | Mending is now stylish, and choosing differs from needing. | OK. C fails: "The people who mend out of need have gained nothing." | Pass |
| PS03 | Para-summary | B | Scoring across many forecasts is "the only way" to test a claim about chance. | OK. C repeats the mistake being corrected. | Pass |
| PS04 | Para-summary | C | Loyalties compete, so a translation is "a judgment". | OK. D moves "betraying" from qualities to the poet. | Pass |
| PS05 | Para-summary | C | Extra time is worth little unless protected from small jobs. | OK. A fails: "This does not mean every project should be rushed." | Pass |
| PS06 | Para-summary | A | The old labels were never free of politics; they "merely obfuscated it". | OK. C takes the critics' side, which the writer rejects. | Pass |
| PS07 | Para-summary | D | The count measures the easy thing; the benefit comes from trees that last. | OK. C fails: "may often be worth more", not stop planting. | Pass |
| PS08 | Para-summary | B | Kindness inflates scores, scores lose meaning, low marks bite harder. | OK. D adds a recommendation the writer never makes. | Pass |
| OS01 | Odd one out | 3 | 1, 2, 4, 5 are about cues for finding the way; 3 is about distance. | OK. No other sentence could leave. | Pass |
| OS02 | Odd one out | 2 | 4, 5, 1, 3 tell the story of receipts; 2 is about what coins looked like. | OK. No other sentence could leave. | Pass |
| OS03 | Odd one out | 5 | 4, 2, 3, 1 explain a language fading; 5 is about adult learners. | OK. No other sentence could leave. | Pass |
| OS04 | Odd one out | 1 | 2, 4, 3, 5 are about the bicycle and women's freedom; 1 is about comfort. | Sentence 1 reworded for a fact (see below). "many riders" became "some riders". It is still the only sentence not about women, but see open doubt 2. | Fixed |
| OS05 | Odd one out | 4 | 2, 5, 1, 3 treat ice as a record; 4 is about rivers today. | OK. "also" is a lure, nothing more. | Pass |
| OS06 | Odd one out | 3 | 2, 4, 1, 5 explain the PIN code; 3 is about letters declining. | OK. No other sentence could leave. | Pass |

## Fact checks

Most results below came from web search summaries, not from reading the full source. Entries marked "fetched" came from a single page, returned through a summarising tool. Only the Seeley PDF did I read as text.

| Claim | Where | Result | Source |
|---|---|---|---|
| Metre set as one ten-millionth of pole to equator; Dunkirk to Barcelona survey; platinum bar in 1799 | RC3 | Confirmed | Wikipedia, History of the metre (fetched) |
| Bar "cast" in platinum | RC3 | Not confirmed. Sources say only "made of platinum". Now "made into a platinum bar". | Wikipedia, History of the metre |
| Bar came out short by a fraction of a millimetre | RC3 | Confirmed, about 0.2 mm | Wikipedia, History of the metre; Physics Today review |
| Méchain's unexplained discrepancy, not fully disclosed, found later | RC3 | Confirmed. Barcelona latitude readings disagreed; he kept this secret, and it came to light after his death. | Physics Today review; Ken Alder interview, Northwestern |
| Later surveys, and the bar kept as it was | RC3 | Confirmed. The 1889 prototype matched the Mètre des Archives in length. | Wikipedia, History of the metre |
| Metre Convention 1875; 1889 bars; 1960 krypton; 1983 speed of light | RC3 | Confirmed | Wikipedia, History of the metre |
| "For all times and all peoples" | RC3 | Confirmed as the motto of the reform | Académie des sciences |
| Lords shading measures; a popular grievance before 1789 | RC3 | Confirmed from the cahiers of 1789 | UNESCO metric system document; Mesure Lab transcription |
| Old queen leaves in late spring; a few hundred scouts; queen takes no part | RC2 | Confirmed. Swarms are near 10,000, so "several thousand" became "thousands". | Seeley, Visscher and Passino, American Scientist 2006 (read the PDF text) |
| Scouts are older workers | RC2 | Confirmed: "a swarm's oldest bees" | Seeley excerpt, Harvard Magazine (fetched) |
| Better sites get more dance circuits; dances shrink each trip; quorum, then warm-up; no need for all to agree | RC2 | Confirmed | Seeley et al. 2006 (read the PDF text) |
| Without fading, a swarm would be slower to decide | RC2-3 key | **Not supported.** Seeley's model points to split decisions, and one study found faster but less accurate decisions. Key option reworded. | Seeley et al. 2006; a modelling study quoted in search results, which I did not trace to its paper |
| Single line "does not make waiting shorter" | RC5 | **Overstated.** Queueing theory says a pooled line usually cuts the average wait. Now says a shorter wait is "not the main gift". "May barely change" is kept as a hedged claim. | Third Bit and Marc Brooker blogs; Kenan Institute summary |
| People prefer a longer orderly wait to a shorter disorderly one | RC5 | Could not confirm that exact finding. Now "can feel easier to bear". | Larson 1987 abstract supports the fairness point only |
| Few keepers lived alone | RC4 | Could not confirm the number. Now "Many keepers lived with family or crewmates". | Michigan and NOAA keeper histories |
| Log of oil; inspectors, often unannounced; dismissal; uniforms | RC4 | Confirmed, mainly for the US service | US Lighthouse Society; 1881 Instructions to Light Keepers |
| Keepers moved between stations | RC4 | Rotation confirmed. The motive is not, so I added "perhaps". | GENUKI; an older survey on PubMed Central |
| Wives and daughters tended lamps and took the post | RC4 | Confirmed | NOAA; Michigan Public |
| Welsh rock tale of two keepers | RC4 | Confirmed as a told story. Length varies from weeks to months, so "for weeks" stands. The passage already says details may not be true. | Countryfile; other popular accounts |
| Schools cutting cursive; note-taking studies not always replicated | RC6 | Confirmed | Education Week; Morehead et al. 2019; Urry et al. 2021 |
| Variolation in Asia and Africa; dose could kill | PJ04 | Confirmed, 1 to 2 per cent died | US National Library of Medicine |
| Jenner 1796; "vaccine" from Latin for cow | PJ04 | Confirmed | WHO |
| 1950s American trucking businessman and containers | PJ06 | Confirmed: Malcom McLean, 1956 | Wikipedia, SS Ideal X; Harvard Business School |
| 1858 cable failed within weeks; 1866 Great Eastern, largest ship | PJ10 | Confirmed | Engineering and Technology History Wiki; Science Museum; The Henry Ford |
| British towns kept local time; railways moved first | PJ01 | Confirmed | Wikipedia, Railway time; timeanddate.com |
| Stepwells in western India; piped water later replaced them | PJ02 | Confirmed | Wikipedia, Stepwell |
| Tiffin carriers, colour and symbol codes, little schooling | PJ07 | Confirmed. Daily box counts vary and the famous error rate is loosely sourced, so the new wording gives no rate. | NBC News; Outlook Traveller |
| Mangroves cleared for shrimp ponds; roots protect the shore | PJ08 | Confirmed | Frontiers in Forests and Global Change; IUCN |
| Merchants' receipts in China; the state took over paper | OS02 | Confirmed. Sources differ on whether flying cash counts as paper money, but the sentences do not say so. | Search summaries of currency histories |
| Bird navigation by sun, stars and magnetic field | OS01 | Confirmed | All About Birds; Princeton |
| Languages die mostly through lost transmission to children | OS03 | Broadly confirmed, with the word "usually" kept | UNESCO language vitality paper; Wikipedia, Endangered language |
| Air tyre "patented shortly before" the 1890s | OS04 | **False as worded.** Thomson patented it in 1845 and Dunlop in 1888. Now "The practical air-filled tyre, developed shortly before". | Britannica; EBSCO |
| Women, escorts, dress and campaigners | OS04 | Confirmed. Most women kept long skirts, so "many riders" became "some riders". | National Women's History Museum (fetched); British Online Archives; Warwick library |
| Ice layers and bubbles; glacier melt feeds Asian rivers | OS05 | Confirmed. Shares of melt are disputed, but the sentence gives none. | antarcticglaciers.org; World Water Atlas |
| PIN code 1972, six digits, purpose | OS06 | Confirmed: 15 August 1972 | The Better India; Vikaspedia |

**Not checked by search.** RC1 has no dated or checkable facts, only argument. Para-summaries PS01 to PS08 and para-jumbles PJ03, PJ05 and PJ09 make general claims that I judged on reasoning alone. Three fetches failed: American Scientist (503), PubMed Central (browser check), Smithsonian (403). I covered those points from other sources.

## Vocabulary review

I read all 150 `simple` entries and all 150 practice entries, which is more than the 40 asked for. That read was faster than the VARC pass, so treat it as a careful skim. A script also checked all 150 for: the word in its own blank sentence, the simple word in its own sentence, article clues, mixed parts of speech, duplicate options, and answer position. It found 0 problems on those checks.

**`simple` words changed (10).** The six you flagged, plus four I noticed. Each `simple` matches the practice answer.

| Word | Old | New | Why |
|---|---|---|---|
| stagnant | inactive | sluggish | "Inactive water" does not work; "sluggish" fits water and economies. |
| elusive | slippery | hard to find | Fails on the snow leopard example. |
| laborious | tiring | slow and hard | "Tiring" misses the slowness. |
| perfunctory | hasty | half-hearted | The point is lack of care, not speed. |
| rhetoric | language | fine words | "Language" loses the sense of persuasion. |
| egalitarian | fair | classless | A pay scale can be fair without being equal. |
| ambivalent | unsure | torn | The meaning is mixed feelings, not doubt. |
| inherent | natural | built-in | "Natural risks" of a business reads wrongly. |
| jeopardise | risk | endanger | "A weak monsoon could risk the rice crop" fails. |
| solitary | lonely | lone | A solitary hunter is not a lonely one. |

**Left loose on purpose.** ubiquitous→common, erode→weaken, acquiesce→agree, exemption→freedom, nascent→new and impede→block lose some force but work as swaps.

**Usage format cue, fixed.** The correct sentence was strictly the longest in 84 of 150 entries, where chance is about 1 in 4. I extended one wrong sentence in the 48 worst cases. It is now 36 of 150. All 48 remain clearly wrong. The rest of the practice items needed no change. In every entry I read, one sentence is correct, one word fits each blank, and no distractor is a synonym of the answer.

For the three multi-word answers, the distractors became phrases too, so length gives nothing away.

## Changes made

- **Keys:** none changed.
- **`trapIndex`:** none changed.
- **`commonWrong`:** PJ09 only (3412 to 3421).
- **`trap` label:** RC3-1 only (Distortion to Reversal).
- **Passages:** RC2 (thousands), RC3 (made into), RC4 (crewmates, perhaps), RC5 (two sentences). All stay within limits: 573, 543, 567, 530, 534 and 559 words with 7, 8, 8, 8, 9 and 9 list words.
- **Questions:** RC2-1, RC2-3, RC3-1 options; RC2-3, RC5-2 explanations.
- **Para-jumbles:** PJ01, 03, 04, 05, 07, 08, 09 sentences and explanations.
- **Odd sentence out:** OS04 sentences 1 and 3.
- **Vocabulary:** 10 `simple` words with their practice options, plus 48 usage sentences.
- **Ids, counts and types:** unchanged.
- **Other content:** the new `src/content/community.ts` appeared during this review. I read its notes on RC2-3, RC3-1, PJ01, PJ03, PJ04 and PJ05, and none conflict with these edits.

## Test results

- `npx vitest run tests/content.test.ts`: 365 passed, 0 failed.
- `npx tsc --noEmit`: no errors in any file.
- My first run showed 2 failing tests (QA034 and a QA prompt with an exclamation mark) and type errors in `src/pages/ReviewDetail.tsx`. None were in my four files, and all were gone by the last run. Someone else changed those files during this review, so I did not fix them or check how they were fixed.
- A small script confirmed that the keys in the log above match the source for all 48 items.

## Open doubts for a human

1. **No blind solve was done.** Please have one student solve a printout of all 48 with no keys. A wrong answer from a good student is the most useful signal left.
2. **OS04 is the closest call.** The tyre sentence can be read as background to the 1890s boom. It is still the best sentence to remove, as the only one not about women, but a strong student may object. Rated Hard, which seems fair.
3. **Para-jumble uniqueness is my judgement.** No test can prove it. I closed second orders in seven items, some strong (PJ03, PJ07, PJ08, PJ09) and some weak (PJ01, PJ04, PJ05), which suggests the first pass missed some. Two people solving the PJ set separately would be a good check, especially the three I passed unchanged (PJ02, PJ06, PJ10).
4. **Sources are uneven.** Some claims rest on popular accounts: the Welsh rock tale, the tiffin carriers, and keeper uniforms. The RC4 details lean on the US service, while the passage speaks generally.
5. **RC5 "may barely change the average wait".** This stands as a hedged claim. It holds best where customers switch between lines. A queueing specialist might still prefer softer wording.
6. **The vocabulary card was not viewed in the running app.** "hard to find", "slow and hard" and "fine words" are longer than other entries, so someone should check they sit well in the card.
