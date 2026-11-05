export const SUPPORTED_LANGUAGES = [
  {
    id: 'pig',
    name: 'Apache Pig Latin',
    extension: '.pig',
    monacoLang: 'pig',
    category: 'Big Data',
    color: '#ec4899',
    badge: 'Big Data',
    defaultCode: `-- Big Data Online Lab: Apache Pig Latin
students = LOAD 'students.csv' USING PigStorage(',') AS (
    id:int, name:chararray, age:int, gender:chararray, major:chararray, gpa:float, credits:int
);

-- Filter students with GPA >= 3.7
honor_students = FILTER students BY gpa >= 3.7;

-- Project columns and dump
result = FOREACH honor_students GENERATE id, name, major, gpa;
DUMP result;
`
  },
  {
    id: 'mapreduce',
    name: 'Hadoop MapReduce',
    extension: '.java',
    monacoLang: 'java',
    category: 'Big Data',
    color: '#f59e0b',
    badge: 'Hadoop',
    defaultCode: `import java.io.IOException;
import java.util.StringTokenizer;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.IntWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class WordCount {
    public static class TokenizerMapper extends Mapper<Object, Text, Text, IntWritable> {
        private final static IntWritable one = new IntWritable(1);
        private Text word = new Text();

        public void map(Object key, Text value, Context context) throws IOException, InterruptedException {
            StringTokenizer itr = new StringTokenizer(value.toString());
            while (itr.hasMoreTokens()) {
                word.set(itr.nextToken().replaceAll("[^a-zA-Z]", ""));
                if (word.getLength() > 0) context.write(word, one);
            }
        }
    }

    public static class IntSumReducer extends Reducer<Text, IntWritable, Text, IntWritable> {
        private IntWritable result = new IntWritable();
        public void reduce(Text key, Iterable<IntWritable> values, Context context) throws IOException, InterruptedException {
            int sum = 0;
            for (IntWritable val : values) sum += val.get();
            result.set(sum);
            context.write(key, result);
        }
    }

    public static void main(String[] args) throws Exception {
        Configuration conf = new Configuration();
        Job job = Job.getInstance(conf, "word count");
        job.setJarByClass(WordCount.class);
        job.setMapperClass(TokenizerMapper.class);
        job.setCombinerClass(IntSumReducer.class);
        job.setReducerClass(IntSumReducer.class);
        job.setOutputKeyClass(Text.class);
        job.setOutputValueClass(IntWritable.class);
        FileInputFormat.addInputPath(job, new Path("wordcount_input.txt"));
        FileOutputFormat.setOutputPath(job, new Path("output_wordcount"));
        System.exit(job.waitForCompletion(true) ? 0 : 1);
    }
}
`
  },
  {
    id: 'python',
    name: 'Python',
    extension: '.py',
    monacoLang: 'python',
    category: 'General',
    color: '#38bdf8',
    badge: 'Popular',
    defaultCode: `import sys
import pandas as pd

print("=== Big Data Online Lab: Python 3 ===")
df = pd.read_csv('students.csv')
print(f"Loaded {len(df)} records from students.csv\\n")
print(df.groupby('major')['gpa'].mean())
`
  },
  {
    id: 'cpp',
    name: 'C++',
    extension: '.cpp',
    monacoLang: 'cpp',
    category: 'Systems',
    color: '#818cf8',
    badge: 'Fast',
    defaultCode: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "=== Big Data Online Lab: C++17 Execution ===\\n";
    std::vector<int> data = {10, 25, 40, 55, 70, 85, 100};
    double sum = std::accumulate(data.begin(), data.end(), 0.0);
    std::cout << "Sum: " << sum << ", Average: " << (sum / data.size()) << "\\n";
    return 0;
}
`
  },
  {
    id: 'c',
    name: 'C',
    extension: '.c',
    monacoLang: 'c',
    category: 'Systems',
    color: '#60a5fa',
    defaultCode: `#include <stdio.h>

int main() {
    printf("=== Big Data Online Lab: C (GCC) ===\\n");
    int arr[] = {12, 45, 67, 89, 23, 90};
    int n = sizeof(arr)/sizeof(arr[0]);
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    printf("Calculated Maximum element: %d\\n", max);
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    extension: '.java',
    monacoLang: 'java',
    category: 'General',
    color: '#f97316',
    defaultCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Big Data Online Lab: Java OpenJDK 17 ===");
        System.out.println("Java Virtual Machine: " + System.getProperty("java.version"));
        System.out.println("Ready to compile and run OOP and Big Data architectures.");
    }
}
`
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    extension: '.js',
    monacoLang: 'javascript',
    category: 'Web',
    color: '#facc15',
    defaultCode: `console.log("=== Big Data Online Lab: Node.js Runtime ===");
const dataset = [
  { item: "Server Node A", load: 0.45 },
  { item: "Server Node B", load: 0.82 },
  { item: "Server Node C", load: 0.29 }
];
console.table(dataset);
`
  },
  {
    id: 'html',
    name: 'HTML / CSS / JS',
    extension: '.html',
    monacoLang: 'html',
    category: 'Web',
    color: '#e11d48',
    badge: 'Live Preview',
    defaultCode: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0f172a; color: #fff; font-family: sans-serif; padding: 20px; }
    .card { background: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #475569; }
    h2 { color: #818cf8; margin: 0 0 10px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Cluster Live Visualizer</h2>
    <p>Render interactive telemetry dashboards directly in the browser preview.</p>
  </div>
</body>
</html>
`
  },
  {
    id: 'sql',
    name: 'SQL',
    extension: '.sql',
    monacoLang: 'sql',
    category: 'Data',
    color: '#06b6d4',
    badge: 'Tables',
    defaultCode: `CREATE TABLE cluster_nodes (
    node_id INTEGER PRIMARY KEY,
    hostname TEXT NOT NULL,
    ram_gb INTEGER,
    status TEXT
);

INSERT INTO cluster_nodes VALUES (1, 'dn-01.hadoop.local', 64, 'HEALTHY');
INSERT INTO cluster_nodes VALUES (2, 'dn-02.hadoop.local', 64, 'HEALTHY');
INSERT INTO cluster_nodes VALUES (3, 'dn-03.hadoop.local', 128, 'HEALTHY');

SELECT * FROM cluster_nodes WHERE ram_gb >= 64;
`
  },
  {
    id: 'r',
    name: 'R Language',
    extension: '.r',
    monacoLang: 'r',
    category: 'Data',
    color: '#2563eb',
    defaultCode: `cat("=== Big Data Online Lab: R Language ===\\n")
numbers <- c(23, 45, 67, 89, 12, 90, 54)
summary(numbers)
`
  },
  {
    id: 'php',
    name: 'PHP',
    extension: '.php',
    monacoLang: 'php',
    category: 'Web',
    color: '#7c3aed',
    defaultCode: `<?php
echo "=== Big Data Online Lab: PHP Backend ===\\n";
$metrics = ["Pig" => "Installed", "Hadoop" => "Active", "Nodes" => 8];
foreach ($metrics as $k => $v) {
    echo "$k: $v\\n";
}
`
  },
  {
    id: 'go',
    name: 'Go',
    extension: '.go',
    monacoLang: 'go',
    category: 'Systems',
    color: '#00add8',
    defaultCode: `package main
import "fmt"

func main() {
    fmt.Println("=== Big Data Online Lab: Go Runtime ===")
    fmt.Println("High concurrency distributed systems programming.")
}
`
  },
  {
    id: 'ruby',
    name: 'Ruby',
    extension: '.rb',
    monacoLang: 'ruby',
    category: 'General',
    color: '#dc2626',
    defaultCode: `puts "=== Big Data Online Lab: Ruby ==="
data = [10, 20, 30, 40, 50]
puts "Sum: #{data.sum}, Average: #{data.sum.to_f / data.size}"
`
  },
  {
    id: 'bash',
    name: 'Bash Script',
    extension: '.sh',
    monacoLang: 'shell',
    category: 'Systems',
    color: '#10b981',
    defaultCode: `#!/bin/bash
echo "=== Big Data Online Lab: Shell Automation ==="
echo "Operating System: $(uname -a 2>/dev/null || echo 'Linux Sandbox')"
echo "Current Date: $(date)"
`
  }
];

export function registerPigLanguage(monaco) {
  if (!monaco.languages.getLanguages().some((l) => l.id === 'pig')) {
    monaco.languages.register({ id: 'pig' });
    monaco.languages.setMonarchTokensProvider('pig', {
      keywords: [
        'LOAD', 'USING', 'PigStorage', 'AS', 'FILTER', 'BY', 'FOREACH', 'GENERATE',
        'GROUP', 'ALL', 'JOIN', 'ORDER', 'DESC', 'ASC', 'DISTINCT', 'STORE', 'INTO',
        'DUMP', 'DESCRIBE', 'LIMIT', 'UNION', 'AND', 'OR', 'NOT', 'FLATTEN', 'SPLIT'
      ],
      types: [
        'int', 'long', 'float', 'double', 'chararray', 'bytearray', 'boolean',
        'datetime', 'biginteger', 'bigdecimal', 'tuple', 'bag', 'map'
      ],
      builtins: [
        'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COUNT_STAR', 'ROUND', 'CONCAT',
        'SUBSTRING', 'INDEXOF', 'LOWER', 'UPPER', 'TRIM', 'REGEX_EXTRACT'
      ],
      tokenizer: {
        root: [
          [/--.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/'([^'\\]|\\.)*'/, 'string'],
          [/"([^"\\]|\\.)*"/, 'string'],
          [/[0-9]+(\.[0-9]+)?/, 'number'],
          [/[a-zA-Z_]\w*/, {
            cases: {
              '@keywords': 'keyword',
              '@types': 'type',
              '@builtins': 'predefined',
              '@default': 'identifier'
            }
          }],
          [/[;,()]/, 'delimiter'],
          [/[=><!+\-*/%]/, 'operator']
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ]
      }
    });
  }
}

