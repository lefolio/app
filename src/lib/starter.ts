export const STARTER_HOME_MD = `::: hero
# My Brand
## We build stuff that we care about

![Hero image](Assets/hero-image.png)

[Buy our stuff](/our-stuff)
[Learn more about us](/about-us)
:::

::: about
## Our Story

Carefully crafting products and services for a decade with a passion for details.

![Side image](Assets/about-image.png)
:::

::: testimonials
## Customer 1
### Product manager
Working with X was a real pleasure.

## Customer 2
### Account manager
X really helped us create the client relationship we wanted.
:::
`.trimStart();

export const DEFAULT_AGENT_PROMPT = `Build a lefolio.md site from this Home.md draft.

Use the ::: component blocks as structured content.
Create React components that parse each block and render the page.`;
