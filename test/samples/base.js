import test from "ava";
import { join } from "path";
import { rollup } from "rollup";
import { testBundle } from "../../util/test";
import { copySync, ensureDirSync } from "fs-extra"

import resolve from "../..";

process.chdir(join(__dirname, "../fixtures/base"));

function gen(t) {
	return async (base, input, answer) => {
		const bundle = await rollup({
			plugins: [resolve({ base })],
			input
		});
		let { result } = await testBundle(t, bundle);
		t.deepEqual(result, { answer });
	}
}

test("[base option: default] normal", async t => {
	let find = gen(t)
	find(undefined, 'find.js', 11)
	find(undefined, 'a/b/find.js', 83)
});
test("[base option: default] navigator", async t => {
	let find = gen(t)
	find(undefined, 'a/b/find_with_prev_default.js', 137)
	find(undefined, 'a/find_with_prev_default.js', 73)
});

test("[base option: specified] normal", async t => {
	let find = gen(t)
	find('a', 'a/find.js', 73)
	find('a/b', 'a/find.js', 11)
});
test("[base option: specified] navigator", async t => {
	let find = gen(t)
	find('a', 'a/find_with_prev_a.js', 73)
	find('a/b', 'a/b/find_with_prev_b.js', 137)
});

test("[base option: specified, prev] navigator", async t => {
	let find = gen(t)
	find('./a/../', 'a/find.js', 83)
	find('../', 'a/find.js', 137)
});

test("[base option: specified, absolute] navigator", async t => {
	let find = gen(t)

	let id = Date.now() + "" + Math.random()
	let dest = join(process.env["HOME"], "/tmp/@zrlps/rollup-plugin-resolve/test_" + id)
	ensureDirSync(dest)
	copySync("./", dest)

	copyFileSync("a/find.js", "")

	find(dest + './a/../', 'a/find.js', 83)
	find('../', 'a/find.js', 137)
});

process.chdir(join(__dirname, "../fixtures/base_width_relative"));
test("[base] with relative navigator", async t => {
	const bundle = await rollup({
		plugins: [resolve()],
		input: "main.js"
	});
	let { result } = await testBundle(t, bundle);
	t.deepEqual(result, {
		answer: 97
	});
});