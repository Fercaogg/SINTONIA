"""Réplica en Python de SX.M / SX.QM (assets/js/sx.js): tiempo del corte original → tiempo final."""
import math
HOLDS = [(6.5, 1.0), (9.0, 1.0), (11.0, 1.0), (12.5, 2.0), (16.5, 1.0), (21.5, .5), (24.5, 1.0),
         (27.5, 1.5), (30.5, 1.0), (34.5, 2.0), (36.5, .5), (39.5, .5), (44.5, 2.0)]
B140 = 60 / 140
def M(t): return t + sum(h for p, h in HOLDS if t >= p)
def Q(f):
    a = math.floor(f * 2 + 0.5 + 1e-9) / 2
    return math.floor(a / B140 + 0.5) * B140 + (f - a)
def QM(t): return Q(M(t))
