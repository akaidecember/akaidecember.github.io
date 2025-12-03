---
layout: post
title: "Building a Hash Table From Scratch, My Walkthrough"
date: 2025-11-30
description: "Following James Routley’s “Write a Hash Table” repo and notes from rebuilding it myself"
tags: [c, data-structures, hashing]
---

*Following James Routley’s “Write a Hash Table” repo*  
*By Anshul Kumar Shandilya*

---

```This is my first writeup on my own website, and I definitely don't expect anyone to read this, but I have a website up and running with a blog section lying empty, so I might as well should write something. This blog section is mostly for my own practice of not staying idle and wasting time watching youtube crap. So when I write something here, most probably I am trying to learn something and making notes about it, while uploading it here, as a notebook for me to access anywhere.```

There’s something strangely satisfying about building a data structure we use every day but rarely think about. Arrays, lists, stacks,  sure, I’ve written those from scratch. But a **hash table**? That always felt like one of those things that “just exists,” quietly powering dictionaries, maps, caches, and half of modern computing.

When I found James Routley’s repository on implementing a hash table in C, I knew it would be fun to follow. This little project reminded me why low-level work feels so grounding: you can actually *see* how things fit together instead of hiding behind abstractions all day.

This post is a walkthrough of the repo in **my own words**, with the snippets I wrote or tweaked along the way.

---

## Why build a hash table manually?

- I encountered this as an interview question, and I could not answer it, so might as well make sure that I am prepared the next time, if any.
- To see how collisions actually work in practice
- To understand how memory allocation shapes performance  
- To revisit C after spending way too much time in Python and Java  
- And honestly, because writing things from scratch clears the mental fog

Hash tables feel magical when you use them in Python (`dict`) or Java (`HashMap`). Underneath, the idea is beautifully simple:

> Take a key → run it through a hash function → get an index → store your value there.

Until everything goes wrong, > collisions, resizing, memory fragmentation, and so on. That’s the fun part.

---

## The data structures

Routley’s implementation keeps things simple:

- each entry is a `ht_item`
- the table is an array of pointers to items
- when collisions happen, it uses open addressing with linear probing

```c
typedef struct {
    char* key;
    char* value;
} ht_item;

typedef struct {
    int size;
    int count;
    ht_item** items;
} ht_hash_table;
```

When I first saw this, I had a nostalgic flashback to my early days writing C,  manually handling memory, copying strings, and hoping nothing segfaults.

---

## The hash function

This part looks simple but hides all the subtlety. Routley uses **FNV-1a**,  a classic, lightweight hash for small keys.

```c
unsigned long hash(const char* str) {
    unsigned long hash = 146527;
    for (int i = 0; str[i]; i++) {
        hash ^= str[i];
        hash *= 16777619;
    }
    return hash;
}
```

Python’s hash is robust, salted, and collision-resistant, implemented in hundreds of lines. In C, you can get something workable in six.

---

## Creating the table

`create_table()` allocates memory, sets up the array of pointers, and initializes everything to `NULL`.

```c
ht_hash_table* ht_new() {
    ht_hash_table* ht = malloc(sizeof(ht_hash_table));
    ht->size = 53;
    ht->count = 0;
    ht->items = calloc((size_t)ht->size, sizeof(ht_item*));
    return ht;
}
```

---

## Inserting items

Insert is where hash table logic becomes real. You juggle hashing, probing, resolving collisions, copying keys/values, and resizing.

```c
void ht_insert(ht_hash_table* ht, const char* key, const char* value) {
    ht_item* item = ht_new_item(key, value);
    int index = hash(key) % ht->size;

    while (ht->items[index] != NULL) {
        if (strcmp(ht->items[index]->key, key) == 0) {
            ht_del_item(ht->items[index]);
            ht->items[index] = item;
            return;
        }
        index = (index + 1) % ht->size;
    }

    ht->items[index] = item;
    ht->count++;
}
```

The “walk the array until you find a spot” approach is so simple, yet visualizing it at runtime makes you appreciate how bigger languages handle this efficiently.

---

## Searching the table

Search mirrors insert,  compute the hash, probe until the key matches or you hit an empty slot.

```c
char* ht_search(ht_hash_table* ht, const char* key) {
    int index = hash(key) % ht->size;

    while (ht->items[index] != NULL) {
        if (strcmp(ht->items[index]->key, key) == 0) {
            return ht->items[index]->value;
        }
        index = (index + 1) % ht->size;
    }

    return NULL;
}
```

---

## Handling collisions

Plenty of tutorials jump into separate chaining with linked lists. Routley takes the opposite approach: **open addressing** with **linear probing**.

1. Hash the key  
2. Check the index  
3. If it’s taken, move one step  
4. Check again  
5. Repeat until empty

It’s intuitive,  and frustrating if you forget to wrap with modulo and end up in an infinite loop.

---

## Deleting items

Deleting in open addressing isn’t straightforward. If you remove elements physically, you can break the probe chain. The repo solves this with a special sentinel item (a placeholder):

```c
static ht_item HT_DELETED_ITEM = {NULL, NULL};
```

This lets probing continue past deleted cells.

---

## Resizing the table

When your table fills up, you must:

1. Allocate a new table  
2. Re-hash every existing item  
3. Insert them again

```c
void ht_resize(ht_hash_table* ht, const int new_size) {
    ht_hash_table* new_ht = ht_new_sized(new_size);

    for (int i = 0; i < ht->size; i++) {
        ht_item* item = ht->items[i];
        if (item != NULL && item != &HT_DELETED_ITEM) {
            ht_insert(new_ht, item->key, item->value);
        }
    }

    ht->items = new_ht->items;
    ht->size = new_ht->size;
    ht->count = new_ht->count;
}
```

It’s expensive but necessary. Seeing it written out makes Python dict resizing feel like magic,  because we rarely see any of this.

---

## What I learned

1. Hash tables look simple until you implement one. Every decision,  probing strategy, resizing, hashing,  impacts performance.
2. Memory management makes you think differently. After garbage-collected languages, C feels like being trusted with scissors for the first time.
3. Collisions aren’t edge cases,  they’re expected. This changed how I think about caching and indexing in real systems.
4. Writing things from scratch deepens intuition. I understand Python dicts, Redis key hashing, Java `HashMap`, and Go maps better now because I rebuilt a tiny version in C.

---

## Final thoughts

If you’ve never built a data structure manually, I cannot recommend it enough. Yes, it takes time. Yes, it’s frustrating when your pointers misbehave. But the feeling you get when your search function returns the correct value? Worth it.

Hash tables aren’t “too complicated to bother implementing.” They’re just a series of small, logical steps,  like most things in programming that seem intimidating from the outside. This project helped me reconnect with the part of myself that enjoys learning by doing, not just reading. And honestly, I needed that.
