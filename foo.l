let id = \x. x;
let fst = \pair. pair (\x. (\y. x));
let snd = \pair. pair (\x. (\y. y));
let pair = \x. (\y. (\f. f x y));

let x = pair 42 true;

let fix = \f.(\x.f (\v.((x x) v))) (\x.f (\v.((x x) v)));

let fact = fix (\fact. (\g. pair g (fact g)));

fact;

(\x. \y. if true then
  x
else
  y) 42 13
