---
layout: page
title: About
permalink: /about/
weight: 3
---

# **About Me**

Hi, my name is **{{ site.author.name }}** :wave:,<br>
I am a motivated software developer who is always ready to learn about new technologies. My interests lie in 

<div class="row">
{% include about/skills.html title="Programming Skills" source=site.data.programming-skills %}
{% include about/skills.html title="Other Skills" source=site.data.other-skills %}
</div>

## **Experience** 

<div class="row">
{% include about/timeline.html %}
</div>