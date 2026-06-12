# Quiz App Product Flow Map

A reference document comparing **UWorld-style** (serious exam simulation + deep explanation review) and **Pocket Prep-style** (daily habit learning + short quizzes + friendly progress loop) flows. Use this to guide feature design and UX decisions.

---

## 1) UWorld-style quiz app flow

This is more like **serious exam simulation + deep explanation review**.

### Main user flow

Open app

> sign in / create account
> choose exam
> land on dashboard
> see performance, recent blocks, study planner, weak areas
> tap **Create Test**
> choose mode: tutor or timed
> choose unused / incorrect / marked / all
> choose subjects / systems / topics
> choose question count
> start block
> answer Q1
> submit
> see explanation immediately if tutor mode, or move next if timed
> finish block
> review score
> review every question
> read long explanation
> view educational objective / key takeaway
> view charts, tables, images
> mark question
> add note
> create flashcard
> resume review later
> done

### Another core flow: exam simulation

Open app

> dashboard
> create test
> timed mode
> random mixed subjects
> exam-like block size
> start
> answer all without seeing explanations
> submit full block
> get score/performance
> review incorrect first
> review all explanations
> compare with average / percentile if available
> done

### Weakness-repair flow

Open app

> dashboard
> performance by subject/system
> tap weakest area
> generate custom block from weak topics
> do questions
> review explanations
> mark persistent weak concepts
> repeat later
> done

### Incorrects-only flow

Open app

> question bank
> choose **incorrect questions**
> start custom block
> retry old mistakes
> compare new performance vs old
> unmark mastered ones
> keep hard ones marked
> done

### Marked questions flow

Open app

> review center
> filter by marked
> open marked questions
> read explanation again
> add note / flashcard
> retest marked only
> done

### Flashcard / notebook flow

Open app

> open flashcards / notebook
> see saved concepts from past questions
> review by topic
> edit card
> favorite card
> study quick session
> done

### Study planner flow

Open app

> open planner
> enter exam date
> enter study days/hours
> app builds schedule
> today's task list appears
> tap today's assignment
> start recommended block
> complete
> planner updates progress
> done

*This planner-style feature is part of UWorld's official prep ecosystem.*

### Question review flow

Open app

> open completed block
> question list view
> green correct / red wrong / gray omitted
> open one question
> see stem, options, correct answer
> read long rationale
> read why others are wrong
> zoom image / chart
> mark, note, flashcard
> next
> done

### Analytics flow

Open app

> dashboard
> open reports
> see score trends
> see performance by discipline / system / topic
> see time spent per question
> see accuracy
> pick weak topic
> launch targeted quiz
> done

### Mobile quick-study flow

Open app on phone

> resume previous block
> do a few questions
> pause
> later reopen
> continue from same place
> review flashcards on the go
> done

---

## UWorld-style major use cases

### Before exam

Open app

> create mixed timed blocks
> simulate exam
> review deeply
> repeat daily
> done

### During content learning

Open app

> choose one system/topic
> tutor mode
> do small block
> learn from explanations
> make notes/cards
> done

### Fix weak topics

Open app

> analytics
> weak topic
> custom quiz
> review
> done

### Final revision

Open app

> incorrects + marked only
> quick mixed blocks
> high-yield review
> flashcards
> done

---

## What users can do in a UWorld-style app

Open app

> create custom block
> choose timed or tutor
> choose subjects/topics
> choose unused/incorrect/marked
> answer questions
> flag/mark questions
> make notes
> create flashcards
> review detailed explanations
> view analytics
> follow study planner
> resume unfinished block
> redo mistakes
> do self-assessment / mock-like practice depending on product
> done

---

# 2) Pocket Prep-style quiz app flow

This is more like **daily habit learning + short quizzes + friendly progress loop**.

### Main user flow

Open app

> sign in / choose exam
> land on home
> see today's progress
> see streak / question of the day / weak areas
> tap **Quick 10** or similar short mode
> answer 10 questions
> submit each or at end
> see explanation
> continue
> finish short session
> see score
> see topic performance
> done

### Daily habit flow

Open app

> home
> tap **Question of the Day**
> answer 1 question
> see rationale
> maintain streak
> close app
> done

### Build-your-own quiz flow

Open app

> select quiz mode
> choose Build Your Own Quiz
> choose topic
> choose number of questions
> start
> answer
> review explanation
> see score
> done

### Weakest subject flow

Open app

> home / analytics
> tap Weakest Subject
> app auto-builds quiz from worst area
> answer
> review
> improve score
> done

### Level Up flow

Open app

> tap Level Up
> app gives adaptive/progressive challenge
> answer batch
> move through levels
> get sense of progress/game feel
> done

### Missed questions flow

Open app

> study modes
> missed question quiz
> retry only wrong ones
> see whether fixed
> done

### Timed quiz flow

Open app

> choose Timed Quiz
> pick question count / topic
> start timer
> finish
> see score and pacing
> done

### Mock exam flow

Open app

> choose Mock Exam
> take full-length exam
> timer runs continuously
> optional mid-exam break if supported
> submit
> see results
> review explanations
> done

### Performance check flow

Open app

> analytics
> see score by topic
> see strong vs weak categories
> compare with peers if available
> tap a weak category
> launch targeted quiz
> done

---

## Pocket Prep-style major use cases

### Busy user with little time

Open app

> Quick 10
> answer 10
> review short explanations
> close
> done

### Daily consistency user

Open app

> Question of the Day
> maintain streak
> maybe one short quiz
> done

### Topic repair user

Open app

> Weakest Subject
> do targeted quiz
> review
> done

### Pre-exam user

Open app

> Mock Exam
> timed practice
> review explanations
> done

### Casual learner building confidence

Open app

> short quiz
> see friendly progress
> get reinforcement
> repeat tomorrow
> done

---

## What users can do in a Pocket Prep-style app

Open app

> choose exam
> do question of the day
> do Quick 10
> do timed quiz
> do weakest subject quiz
> do missed question quiz
> do build-your-own quiz
> do mock exam
> review explanations
> track streak
> track performance
> compare with peers in some products
> done

---

# 3) Real difference in product flow

## UWorld flow feeling

Open

> choose serious study task
> build custom block
> do harder exam-like questions
> deep explanation review
> save notes/cards
> analyze weaknesses
> repeat

**Core goal:** mastery through **high-quality explanations + exam-style blocks**

## Pocket Prep flow feeling

Open

> do quick daily practice
> short quiz mode
> instant feedback
> streak/progress
> weak area targeting
> repeat tomorrow

**Core goal:** progress through **small sessions + habit loop + lighter friction**

---

# 4) Combined master list of use cases for your own quiz app

If you want to build something like both, users should be able to:

### Account / onboarding

Open app

> sign up
> choose exam
> choose target date
> choose study intensity
> app creates starting plan
> done

### Dashboard

Open app

> see today's tasks
> see streak
> see progress
> see weak topics
> see last quizzes
> done

### Quiz creation

Open app

> create quiz
> choose mode: tutor / timed / exam / quick 10 / weakest / incorrects / marked / custom
> choose topics
> choose source: unused / incorrect / all
> choose difficulty if available
> choose number of questions
> start
> done

### In-quiz actions

Question opens

> read stem
> choose answer
> eliminate options
> mark for review
> add note
> submit
> see explanation now or later depending on mode
> next
> done

### Post-quiz review

Finish quiz

> score screen
> correct/incorrect/omitted summary
> review all
> review wrong only
> mark hard questions
> save flashcards
> schedule retry
> done

### Analytics

Open analytics

> see score trend
> see topic mastery
> see pace
> see weak areas
> see improvement over time
> launch practice from weakness
> done

### Memory tools

Open review tools

> flashcards
> notes
> bookmarks
> marked questions
> incorrect questions
> spaced repetition due today
> done

### Study plan

Open planner

> see daily tasks
> start assigned quiz
> complete
> planner updates
> done

### Social / motivation if you want

Open app

> see streak
> badges
> leaderboard
> challenge friend
> share progress card
> done

---

# 5) Very simple "open > x > x" cheat sheet

## UWorld-like

Open app

> dashboard
> create test
> choose timed/tutor
> choose topics + unused/incorrect
> start block
> answer questions
> finish block
> review detailed explanations
> mark/note/flashcard
> check analytics
> done

## Pocket Prep-like

Open app

> home
> tap Quick 10 / Question of the Day / Weakest Subject
> answer questions
> see explanations
> finish short quiz
> update streak/progress
> done

---

# 6) Best way to combine both in your app

You can make one app with 2 clear entry buttons:

### Mode 1: Deep Study

Open

> create serious block
> timed/tutor
> full explanations
> review
> analytics
> done

### Mode 2: Quick Practice

Open

> Quick 10 / daily question / weakest topic
> fast session
> explanation
> streak
> done

That gives you:

* **UWorld power**
* **Pocket Prep habit loop**

And that is probably the best product shape for exam prep.

---

## References

- [UWorld Medical - Study Planner](https://medical.uworld.com/usmle/features/study-planner/)
- [UWorld Nursing - Mobile App](https://nursing.uworld.com/features/mobile-app/)
- [UWorld Medical - USMLE Step 1](https://medical.uworld.com/usmle/usmle-step-1/)
- [Pocket Prep - Google Play](https://play.google.com/store/apps/details?id=com.pocketprep.android.professional)
- [Pocket Prep - Mock Exams](https://www.pocketprep.com/mock-exams/)
- [Pocket Prep - App Store](https://apps.apple.com/us/app/pocket-prep-professional-2026/id1503584541)
- [Pocket Prep - Home](https://www.pocketprep.com/)
