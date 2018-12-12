import { and, each, is, isClass, mixins, not, or, validate } from "../index";

class IdClass {
  @validate(each(
    is.int(),
    not.in([3]),
    is.required(),
  ))
  public id: number[];
}

class Id2Class {
  @validate(each(
    each(is.int(), is.required(), not.doubleEquals(2)),
  ))
  public id: number[][];
}

class NameClass {
  @validate(is.length(4, 10), is.contains("360"))
  public name: string;
}

class ValidateIsClass {
  @validate(is.email())
  public email: string;

  @validate(is.base64())
  public base64: WindowBase64;

  @validate(is.ascii())
  public ascii: string;

  @validate(is.after())
  public date: Date;

  @validate(is.port())
  public port: string;

  @validate(is.dataURI())
  public dataURI: string;

  @validate(is.creditCard())
  public creditCard: string;
}

class NestedClass {
  @validate(is.class(IdClass))
  public id: IdClass;
}

class DeeplyNestedClass {
  @validate(is.class(NestedClass))
  public value: NestedClass;
}

class AndOrClass {
  @validate(or(
    is.in([1, 2, 3]),
    and(
      is.in([4, 5, 6]),
      is.divisibleBy(2),
    ),
  ))
  public value: number;
}

class OnlyIfClass {
  @validate(is.in([1, 2, 3]).onlyIf((target) => (target as any).value2 !== undefined))
  public status: number;
  @validate(is.int())
  public value2: number;
}

class CustomizeMessageClass {
  @validate(
    is.required().message("field is required!!"),
    is.equals("some value").message("field must equals to some vlaue!!"),
    or(
      is.in([1, 2]),
      is.equals(3),
    ).message("field must be 1,2 or 3, just kidding LOL."),
  )
  public field: string;
}

// 组合复用
@mixins(IdClass, NameClass)
class MixinClass implements IdClass, NameClass {
  public name: string;
  public id: number[];
  @validate(
    is.int(),
    is.required(),
  )
  public numberValue: number;
}

// 不支持继承复用

test("each", () => {
  expect(isClass(IdClass, { id: [111] })).toBe(true);
  expect(isClass(IdClass, { id: [111, 3] })).not.toBe(true);
});

test("is string", () => {
  expect(isClass(NameClass, { name: "360sdfsdf" })).toBe(true);
  expect(isClass(NameClass, { name: "360" })).not.toBe(true);
  expect(isClass(NameClass, { name: "13602545698" })).not.toBe(true);
  expect(isClass(NameClass, { name: "sdfsdfs" })).not.toBe(true);
});

test("is email", () => {
  expect(isClass(ValidateIsClass, { email: "jason@gmail.com" })).toBe(true);
  expect(isClass(ValidateIsClass, { email: 'jason@gmail' })).not.toBe(true);
});

test("is base64", () => {
  expect(isClass(ValidateIsClass, { base64: "i am not base64" })).not.toBe(true);
});

test("is ascii", () => {
  // expect(isClass(ValidateIsClass, { ascii: "\u4f60\u597d" })).toBe(true);
  expect(isClass(ValidateIsClass, { ascii: "你好" })).not.toBe(true);
});

test("is after", () => {
  // expect(isClass(ValidateIsClass, { base64: "\u4f60\u597d" })).toBe(true);
  expect(isClass(ValidateIsClass, { date: new Date() })).not.toBe(true);
});

test("is port", () => {
  expect(isClass(ValidateIsClass, { port: '8080' })).toBe(true);
  expect(isClass(ValidateIsClass, { port: '65536' })).toMatch('is port');
  expect(isClass(ValidateIsClass, { port: '65536' })).not.toBe(true);
});

test("is dataURI", () => {
  expect(isClass(ValidateIsClass, { dataURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==' })).toBe(true);
  expect(isClass(ValidateIsClass, { dataURI: 'string' })).toMatch('is dataURI');
  expect(isClass(ValidateIsClass, { dataURI: 'string' })).not.toBe(true);
});

test("is creditCard", () => {
  expect(isClass(ValidateIsClass, { creditCard: '5105105105105100' })).toBe(true);
  expect(isClass(ValidateIsClass, { creditCard: 'string' })).not.toBe(true);
});

test("is number", () => {
  expect(isClass(NameClass, { name: "360sdfsdf" })).toBe(true);
});

test("nexted class", () => {
  expect(isClass(NestedClass, { id: { id: ["122"] } })).toBe(true);
  expect(isClass(NestedClass, { id: 111 })).not.toBe(true);
});

test("deeply nested class", () => {
  const target1 = {
    value: {
      id: {
        id: ["122"],
      },
    },
  };
  expect(isClass(DeeplyNestedClass, target1)).toBe(true);
  const target2 = {
    value: {
      id: {
        id: ["122", "3"],
      },
    },
  };
  expect(isClass(DeeplyNestedClass, target2)).not.toBe(true);
});

test("and or logic", () => {
  expect(isClass(AndOrClass, { value: 1 })).toBe(true);
  expect(isClass(AndOrClass, { value: 2 })).toBe(true);
  expect(isClass(AndOrClass, { value: 3 })).toBe(true);
  expect(isClass(AndOrClass, { value: 4 })).toBe(true);
  expect(isClass(AndOrClass, { value: 5 })).not.toBe(true);
  expect(isClass(AndOrClass, { value: 6 })).toBe(true);
  expect(isClass(AndOrClass, { value: 7 })).not.toBe(true);
});

test("onlyIf", () => {
  expect(isClass(OnlyIfClass, { status: 4 })).toBe(true);
  expect(isClass(OnlyIfClass, { status: 4, value2: 1 })).not.toBe(true);
  expect(isClass(OnlyIfClass, { status: 1, value2: 1 })).toBe(true);
  expect(isClass(OnlyIfClass, { status: 2, value2: 1 })).toBe(true);
  expect(isClass(OnlyIfClass, { status: 3, value2: 1 })).toBe(true);
  expect(isClass(OnlyIfClass, { status: 3, value2: "sdk" })).not.toBe(true);
});

test("customize message", () => {
  expect(isClass(CustomizeMessageClass, {})).toBe("field is required!!");
  expect(isClass(CustomizeMessageClass, { field: "other value" })).toBe("field must equals to some vlaue!!");
  expect(isClass(CustomizeMessageClass, { field: "some value" })).toBe("field must be 1,2 or 3, just kidding LOL.");
});

test("mixin", () => {
  expect(isClass(MixinClass, { id: [1], name: "360name", numberValue: 1 })).toBe(true);
  expect(isClass(MixinClass, { id: [1, "3"], name: "360name", numberValue: 1 })).not.toBe(true);
  expect(isClass(MixinClass, { id: [1], name: "234name", numberValue: 1 })).not.toBe(true);
  expect(isClass(MixinClass, { id: [1], name: "234namesd too long", numberValue: 1 })).not.toBe(true);
  expect(isClass(MixinClass, { id: [1], name: "sfa", numberValue: 1 })).not.toBe(true);
});
