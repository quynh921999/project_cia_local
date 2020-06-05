package com.fit.cia.core.json;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.core.type.WritableTypeId;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.fasterxml.jackson.databind.ser.std.StdSerializer;
import com.fit.cia.core.treemodel.Node;

import java.io.IOException;

public class SimpleNodeForTestSerializer<T> extends StdSerializer<T> {

	public SimpleNodeForTestSerializer() {
		this(null);
	}

	public SimpleNodeForTestSerializer(Class<T> t) {
		super(t);
	}

	@Override
	public void serialize(T value, JsonGenerator gen, SerializerProvider provider) throws IOException {
		if (value instanceof Node) {
			Node node = (Node) value;
			gen.writeNumberField("id", node.getId());
			gen.writeStringField("name", node.getName());
			gen.writeStringField("path", node.getAbsolutePath());
		}
	}

	@Override
	public void serializeWithType(T value, JsonGenerator gen, SerializerProvider serializers, TypeSerializer typeSer) throws IOException {
		final WritableTypeId writableTypeId = typeSer.typeId(value, JsonToken.START_OBJECT);
		typeSer.writeTypePrefix(gen, writableTypeId);
		serialize(value, gen, serializers);
		typeSer.writeTypeSuffix(gen, writableTypeId);
	}
}
