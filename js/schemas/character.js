var x = {
	name: "Character",
	type: "Object",
	members: {
		player: {
			type: "String",
			mock: function() {
				var opts = ['Beth','James','Don','Bond','Jake','Nora'];
				return opts[Math.floor(Math.random() * opts.length)];
			}
		},
		name: {
			type: "String",
			mock: function() {
				var opts = ['Arradeth','Bedwyr','Fjel','Rantoul','Henrik'];
				return opts[Math.floor(Math.random() * opts.length)];
			}
		},
		race: {
			type: "String",
			mock: function() {
				var opts = ['Human','Elf','Dwarf','Half-Elf','Gnome','Kender'];
				return opts[Math.floor(Math.random() * opts.length)];
			}
		},
		classes: {
			type: "Array",
			min: 1,
			elements: {
				type: "Object",
				name: "CharacterClass",
				members: {
					name: {
						type: "String",
						mock: function() {
							var opts = ['Fighter','Mage','Thief','Cleric'];
							return opts[Math.floor(Math.random() * opts.length)];
						}
					},
					XP: {type: "Integer", min: 0, max: 100000},
					level: {type: "Integer", min: 1, max: 20},
					label: {type: "String"}
				}
			}
		},
		hp: {
			type: "Object",
			members: {
				current: {type: "Integer"},
				max: {type: "Integer"}
			}
		},
		move: {type: "Integer", min: 1, max: 20},
		thac0: {type: "Integer", min: 1, max: 20},
		abilities: {
			type: "Object",
			members: {
				str: {
					type: "Object",
					members: {
						score: {type: "Integer", min: 3, max: 18}
					}
				},
				int: {
					type: "Object",
					members: {
						score: {type: "Integer", min: 3, max: 18}
					}
				},
				wis: {
					type: "Object",
					members: {
						score: {type: "Integer", min: 3, max: 18}
					}
				},
				dex: {
					type: "Object",
					members: {
						score: {type: "Integer", min: 3, max: 18}
					}
				},
				con: {
					type: "Object",
					members: {
						score: {type: "Integer", min: 3, max: 18}
					}
				},
				cha: {
					type: "Object",
					members: {
						score: {type: "Integer", min: 3, max: 18}
					}
				}
			}
		}
	}
}