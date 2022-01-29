# Travelling Salesman problem with Simulated Annealing.

#### This project uses simulated annealing to efficiently solve the Travelling Salesman Problem.

---

## Introduction

The Traveling Salesman Problem is one of the most intensively studied problems in computational mathematics. It consists of a salesperson who must visit N cities and return to his starting city using the shortest path possible and without revisiting any cities. In the language of Graph Theory, the Traveling Salesman Problem is an undirected weighted graph and the goal of the problem is to find the Hamiltonian cycle with the lowest total weight along its edges.

## The Traveling Salesman Problem

The Traveling Salesman Problem is considered by computer scientists to belong to the NP-Hard complexity class, meaning that if there were a way to reduce the problem into smaller components, those components would be at least as hard as the original problem. For this reason, and its practical applications, the Traveling Salesman Problem has been widely studied among mathematicians and computer scientists.

They first considered the most obvious solution: the brute force solution. The brute force solution consists of calculating the lengths of every possible route and accepting the shortest route as the solution. The brute force is an unacceptable solution for any graph with more than a few vertices due to the factorial growth of the number of routes. The best achievable rate of growth for the brute force solution is
<br/>

<img src="https://sawyerwelden.files.wordpress.com/2018/03/eq1.png?w=110&zoom=2" style="display: block;margin-left: auto;margin-right: auto;"></img>

## Simulated Annealing

Although we cannot guarantee a solution to the Traveling Salesman Problem any faster than **O(2<sup>n</sup>n<sup>2</sup>)** time, we often times do not need to find the absolute best solution, we only need a solution that is ’good enough.’ For this we can use the probabilistic technique known as simulated annealing. The inspiration for simulated annealing comes from metallurgy, where cooling metal according to certain cooling schedules increases the size of crystals and reduces defects, making the metal easier to work with. As a probabilistic technique, the simulated annealing algorithm explores the solution space and slowly reduces the probability of accepting a worse solution as it runs.

## Improvements to the Algorithm

There are a few practical improvements that we can add to the algorithm. The first of which is specific to Euclidean space, which most real-world applications take place in. Consider again the graph in Figure 1. The route A,B,C,D,A was found to be longer than the route A,B,D,C,A. In the former route, the Edges A,D and B,C overlap, whereas the later route forms a polygon. We can extend this to the general case and say that when solving the Traveling Salesman Problem in Euclidean space, the route from a vertex A to a vertex B should never be farther than the route from A to an intermediate vertex C to B.

<img src="https://sawyerwelden.files.wordpress.com/2018/03/eqmissed.png" style="display: block;margin-left: auto;margin-right: auto;"></img>

<img src="https://sawyerwelden.files.wordpress.com/2018/03/figure2.png" style="display: block;margin-left: auto;margin-right: auto;"></img>

Improvements can also be made in how neighboring states are found and how route distances are calculated. Previously we have only considered finding a neighboring state by swapping 2 vertices in our current route. In some cases, swapping variable numbers of vertices is actually better. This technique, known as v-opt rather than 2-opt is regarded as more powerful than 2-opt when used correctly. How and when to use v-opt is complicated, and may have some overlap with my ISP in preference generation models, where 2-opt is equivalent to Kendall-Tau distance. This is beyond the scope of this paper.

The last two improvements are the easiest to implement. While simulated annealing is designed to avoid local minima as it searches for the global minimum, it does sometimes get stuck. If the simulation is stuck in an unacceptable 4 state for a sufficiently long amount of time, it is advisable to revert to the previous best state. This can be done by storing the best tour and the temperature it was found at and updating both of these every time a new best tour is found.

The simplest improvement does not improve runtime complexity, but makes each computation faster. When computing the distance of a new tour, all but two vertices are in the same order as in the previous tour. Instead of computing all the distances again, only 4 distances need to be computed. To swap vertices C and D in the cycle shown in the graph in Figure 3, the only four distances needed are AC, AD, BC, and BD.

## Conclusion

In conclusion, simulated annealing can be used find solutions to Traveling Salesman Problems and many other NP-hard problems. It does not always find the best solution for the Traveling Salesman Problem as fast as the dynamic programming approach, but always returns a route that is at least close to the solution. It can be bettered by using techniques such as the triangle-inequality heuristic, v-opt, best-state restarts, and intelligent edge-weight calculations.

## References

[1] Traveling salesman problem, Dec 2016.

[2] [Karolis Juodel](https://cs.stackexchange.com/users/5167/karolis-juodel%c4%97) When does the nearest neighbor heuristic fail for the
traveling salesperson? Computer Science Stack Exchange.
[URL](https://cs.stackexchange.com/q/13744): (version: 2013-08-30).

[3] Michael Held and Richard M. Karp. A dynamic programming approach
to sequencing problems. Journal of the Society for Industrial and Applied
Mathematics, 10(1):196210, 1962.

[4] Christian P. Robert. The metropolis-hastings algorithm, Jan 2016.

[5] David S. Johnson. Local optimization and the traveling salesman problem.
In Proceedings of the 17th International Colloquium on Automata,
Languages and Programming, ICALP ’90, pages 446–461, London, UK, UK, 1990. Springer-Verlag.
