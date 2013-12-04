# JSON-schema

JSON-schema provides a simple interface to load and parse JSON schemas (also defined with JSON<sup>†</sup>) and then both validate and mock up objects based on parsed schemas.

## Schema Definitions

Schema "objects" start with a root object of `type` "`Object`" and, ideally, a `name`.

Valid types for members are `String`, `Integer`, `Array`, and `Object`.

The `String`, `Integer`, and `Array` members can optionally include `min` and `max` requirements representing length, value, and element count, respectively.  `String` members may
also optionally define a `pattern` regular expression that a string must match to validate.

An `Object` type must provide a `members` object.  Members may be of any type and depth.

An `Array` type must provide an `elements` object.  This defines the items the array may contain.

Additional planned types to be implemented are `Float` and `Enum`.


### Sample

`
{
	name: "Character",
	type: "Object",
	members: {
		fizz: {
			type: "String",
			min: 10,
			max: 100
		},
		buzz: {
			type: "Integer",
			min: 0
		},
		items: {
			type: "Array",
			max: 3,
			elements: {
				type: "Object",
				members: {
					name: {type: "String"},
					price: {type: "Integer"}
				}
			}
		}
	}
}
`

<sup>†</sup> *not strictly JSON.  For a variety of reasons the schemas are defined with JavaScript.  Among those are things like JSON requiring quoting of object member names and the inability of JSON to contain functions.  Object mocks can optionally use a function to dynamically generate values.*
