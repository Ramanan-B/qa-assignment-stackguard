# AI Notes

## Tool I used

**Claude Code** (an AI coding assistant from Anthropic, Claude Opus 5.5 model), used inside VS Code.

## How I used AI at each step

### 1. Planning
- I gave the AI the assignment and asked for a plan.
- It split the work into steps: test plan → UI tests → API tests → bug reports → README and notes.
- I decided the order and what to include.

### 2. Exploring the websites
- The AI wrote small throw-away scripts that logged in as each Sauce Demo user and called each Restful-Booker endpoint.
- This showed how the sites really behave before I wrote any tests, and is where most of the bugs were first found.

### 3. Test plan
- The AI drafted the risks and the top 10 test cases.
- I chose the priority order and which cases to automate or keep manual, and the reason for each.

### 4. Writing the tests
- The AI drafted the page objects, fixtures and test files.
- I ran every test against the live sites and asked for changes when something was wrong or unclear.
- To check the tests weren't flaky, I ran the whole suite twice in a row: 76 out of 76 passed.

### 5. Bug reports
- The AI suggested the bugs and a severity for each.
- Before writing each report, every bug was reproduced again on the live site, so the steps and values are real, not guessed.
- I checked each severity against the scale at the top of [BUG_REPORTS.md](BUG_REPORTS.md).

### 6. README and notes
- The AI wrote the first drafts, and I edited them.

## How I checked the AI's work

- Ran every test myself on the live sites.
- Reproduced every bug again before reporting it.
- Read every file before committing. I made all commits myself.

## When the AI was wrong

**Main example: the rounding bug**

- **What the AI said:** adding all 6 products shows a rounding bug in the item total (a long number with many decimals). It wrote a test for that.
- **What actually happened:** when I ran the test, it reported "expected to fail, but passed". All 6 products show the correct total, `$129.94`.
- **What the real bug is:** checking other item combinations on the site showed that 5 specific items, worth **$99.95**, are shown as `$99.94999999999999`. The test and bug report BUG-02 now use those 5 items.
- **What I learned:** the AI can state something confidently that isn't true. Running the test against the real site caught it.
