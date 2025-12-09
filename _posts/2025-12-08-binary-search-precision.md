---
layout: post
title: "LC-3453 : Binary Search on Precision: Separating Squares"
date: 2025-06-15
description: "LC-3453 : Using binary search on a continuous answer to bisect square areas with 1e-5 accuracy"
tags: [binary-search, python, leetcode]
---

*Interesting Binary Search Solution for Leetcode-3454*  
*By Anshul Kumar Shandilya*

---

Link to the problem : https://leetcode.com/problems/separate-squares-i/description/

Finding a horizontal line that splits the combined area of axis-aligned squares exactly in half sounds like geometry, but the solution turns into a clean **binary search on the answer**. The key is realizing that as the line moves upward, the area below it increases monotonically—perfect for binary search.

---

## Intuition

So we are given a list of squares represented as (x,y,l) where x and y are the coordinates of the bottom left corner of the square and l is the length of the side of the square. The goal is to find a horizontal line such that the total area of all squares below this line equals exactly half of the total combined area of all squares.
 Also this line needs to be the minimum value for y (as seen in the first example). We use binary search and search on the answer itself. But we are not searching for any index, but a threshold value val (horizontal line y coord) that splits the area. One key observation is as val increases (or you could say the line moves up the y axis), the area of the squares below this line increases.
This makes binary search possible for this problem.

Basically:

- Squares are given as `(x, y, l)` where `(x, y)` is the bottom-left corner and `l` is the side length.
- We need the smallest `y` such that the area of all pieces **below** that line equals half of the total area.
- Because the accumulated area below the line **only increases** as the line goes up, we can binary search on the `y` coordinate itself.

---

## Approach

### Check Function

First, obviously this is not a straight forward binary search. We need a custom check function for the binary search.
In the check function, for a line, we will need to determine the total area of the squares that lie beneath a given horizontal line. (There are other ways of doing this check function, like checking the area above etc.)
Given a horizontal line val, we can iterate through all the squares, and ignore the ones that either start from or are above the line val. For the ones that are completely below the line or are bisected by the line, we calculate the total area as `area += l * min(l, val-y)`.

If the square is at least partially below the line, we compute how much of it lies below:

- The vertical intersection height is `min(l, val - y)`
- If `val - y >= l`, the entire square is below the line, use `l`.
- Otherwise, only part of the square is below, use `val - y`.

Then just return the summed area, which would be the total area below the line val.

### Binary Search

Now that we have a check function, we can use it to find the answer. But there are two more things before we can continue.

**What about the search space?**  
The constraints given to us state that the values for y will start from 0 and not exceed 10^9. Since we are finding the value for y whihc can separate the area for the squares, we can define the search space as:

- `l = 0` and `r = 10**9`.
- So, with this, at any point, we evaluate a height `val = (l + r) / 2`. The key idea is:
- As val increases, the area below the line can only increase or stay the same. This monotonic property allows us to make decisions like:
  - If `check(val) >= half`, the current height cuts too much area, search left `r = mid`
  - Else, try a higher height, search right `l = mid`

**Stopping point?**  
Since the answer is a floating point and not a discrete, we need to make sure that we don't overshoot/undershoot the exact precise answer (accuracy of 10^-5 needed). Instead of the usual stop condition of binary search `l == r`, we need to run it some number of times such that an acceptable answer is obtained.

We also cannot run it as a simple binary search in a loop like `while l < r:`, because the condition will never be met as we are using division and narrowing the gap by a fraction. It may happen that the l and r are very close to each other and due to the way computer handles numbers, mid might become equal to either l or r. This would cause an infinite loop.

Now, we know the upper bound is 10^9 and we need precision of 10^-5. The ratio between the total range and precision required would be 10^14.

This tells us how many equal-width intervals of size 10^-5 fit between 0 and 10^9, which is our search space.

Now, since this is a binary search, and we are dividing each space into two, we can determine the number of itrwations by taking the lograthmic value of 10^14, and since we are reducing the space by half, we use log of base 2 for this:

`log base 2 (10^14) = 46.5 (~47 ceil)`

So, running 47 iterations ensures the final interval is smaller than 10^-5, satisfying the required precision.

---

## Complexity

- Time: `47 * O(n)` where `n` is the number of squares → effectively `O(n)`.
- Space: `O(1)` extra.

---

## Code (Python 3)

```python
def separateSquares(squares: List[List[int]]) -> float:
    half = sum((l * l) for _, _, l in squares) / 2

    def check(val):
        area = 0
        for x, y, l in squares:
            if y >= val:
                continue
            area += l * min(l, val - y)
        return area

    l, r = 0, 10**9
    for _ in range(47):
        mid = (l + r) / 2.0
        area = check(mid)
        if area >= half:
            r = mid
        else:
            l = mid
    return r
```

---