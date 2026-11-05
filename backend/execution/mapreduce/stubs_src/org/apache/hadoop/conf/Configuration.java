package org.apache.hadoop.conf;
import java.util.HashMap;
import java.util.Map;
public class Configuration {
    private Map<String, String> props = new HashMap<>();
    public void set(String name, String value) { props.put(name, value); }
    public String get(String name) { return props.get(name); }
    public String get(String name, String defaultValue) { return props.getOrDefault(name, defaultValue); }
    public int getInt(String name, int defaultValue) {
        String val = props.get(name);
        return val != null ? Integer.parseInt(val) : defaultValue;
    }
}
