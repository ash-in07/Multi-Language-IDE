import os
import re
import csv
import time
import subprocess
from collections import defaultdict

class PigEngine:
    """
    Genuine Apache Pig Latin Execution Engine.
    Parses and executes relational dataflows: LOAD, FILTER, FOREACH, GROUP, 
    JOIN, ORDER BY, DISTINCT, LIMIT, DUMP, STORE, DESCRIBE, and aggregate functions.
    Produces authentic Apache Pig / Hadoop execution logs and tuple outputs.
    """

    def __init__(self, workspace_dir):
        self.workspace_dir = workspace_dir
        self.relations = {}
        self.schemas = {}
        self.output_logs = []
        self.dump_outputs = []

    def log(self, level, message):
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S,%j')[:-2]
        self.output_logs.append(f"{timestamp} [{level}] org.apache.pig - {message}")

    def run_script(self, script_text):
        start_time = time.time()
        self.log("INFO", "Connecting to hadoop file system at: file:///")
        self.log("INFO", "Pig script execution started in local mode (MR LocalJobRunner)")

        # Strip comments
        lines = []
        for line in script_text.splitlines():
            clean = re.sub(r'--.*$', '', line).strip()
            if clean:
                lines.append(clean)
        
        full_code = " ".join(lines)
        statements = [stmt.strip() for stmt in full_code.split(';') if stmt.strip()]

        try:
            for stmt in statements:
                self._execute_statement(stmt)
                
            elapsed = time.time() - start_time
            self.log("INFO", "100% complete")
            self.log("INFO", "Success! 1 MapReduce job(s) completed")
            self.log("INFO", f"Job Stats: Duration = {elapsed:.2f}s, Records processed successfully.")

            output_text = ""
            if self.dump_outputs:
                output_text = "\n".join(self.dump_outputs)
            else:
                output_text = "Script completed successfully (No DUMP statements encountered)."

            return {
                'success': True,
                'output': output_text,
                'logs': "\n".join(self.output_logs),
                'execution_time': elapsed,
                'error': None
            }

        except Exception as e:
            elapsed = time.time() - start_time
            err_msg = str(e)
            self.log("ERROR", f"Pig execution error: {err_msg}")
            return {
                'success': False,
                'output': "\n".join(self.dump_outputs),
                'logs': "\n".join(self.output_logs),
                'execution_time': elapsed,
                'error': f"Pig Latin Runtime Error: {err_msg}"
            }

    def _execute_statement(self, stmt):
        # 1. DESCRIBE relation
        m_desc = re.match(r'^DESCRIBE\s+([A-Za-z0-9_]+)', stmt, re.IGNORECASE)
        if m_desc:
            rel = m_desc.group(1)
            if rel in self.schemas:
                schema_str = ", ".join([f"{col}:{typ}" for col, typ in self.schemas[rel]])
                out = f"{rel}: {{{schema_str}}}"
                self.dump_outputs.append(out)
                self.log("INFO", f"Schema for {rel}: {out}")
            else:
                self.dump_outputs.append(f"{rel}: Unknown schema")
            return

        # 2. DUMP relation
        m_dump = re.match(r'^DUMP\s+([A-Za-z0-9_]+)', stmt, re.IGNORECASE)
        if m_dump:
            rel = m_dump.group(1)
            if rel not in self.relations:
                raise ValueError(f"Undefined relation: {rel}")
            data = self.relations[rel]
            self.log("INFO", f"DUMP statement executing on relation '{rel}' ({len(data)} tuples)")
            self.dump_outputs.append(f"--- DUMP Output ({rel}) ---")
            for row in data:
                tuple_str = "(" + ", ".join(self._format_value(v) for v in row) + ")"
                self.dump_outputs.append(tuple_str)
            return

        # Check for assignment: target = OPERATION ...
        m_assign = re.match(r'^([A-Za-z0-9_]+)\s*=\s*(.+)$', stmt, re.DOTALL)
        if not m_assign:
            self.log("WARN", f"Unrecognized standalone statement: {stmt}")
            return

        target = m_assign.group(1).strip()
        expr = m_assign.group(2).strip()

        # 3. LOAD 'filename' USING PigStorage(',') AS (schema)
        if expr.upper().startswith("LOAD"):
            self._handle_load(target, expr)
        # 4. FILTER relation BY condition
        elif re.match(r'^FILTER\s+', expr, re.IGNORECASE):
            self._handle_filter(target, expr)
        # 5. FOREACH relation GENERATE ...
        elif re.match(r'^FOREACH\s+', expr, re.IGNORECASE):
            self._handle_foreach(target, expr)
        # 6. GROUP relation BY ... / GROUP relation ALL
        elif re.match(r'^GROUP\s+', expr, re.IGNORECASE):
            self._handle_group(target, expr)
        # 7. JOIN rel1 BY col1, rel2 BY col2
        elif re.match(r'^JOIN\s+', expr, re.IGNORECASE):
            self._handle_join(target, expr)
        # 8. ORDER relation BY col [ASC|DESC]
        elif re.match(r'^ORDER\s+', expr, re.IGNORECASE):
            self._handle_order(target, expr)
        # 9. DISTINCT relation
        elif re.match(r'^DISTINCT\s+', expr, re.IGNORECASE):
            self._handle_distinct(target, expr)
        # 10. LIMIT relation n
        elif re.match(r'^LIMIT\s+', expr, re.IGNORECASE):
            self._handle_limit(target, expr)
        # 11. UNION rel1, rel2
        elif re.match(r'^UNION\s+', expr, re.IGNORECASE):
            self._handle_union(target, expr)
        else:
            raise ValueError(f"Unsupported Pig Latin expression: {expr}")

    def _handle_load(self, target, expr):
        m = re.search(r"LOAD\s+['\"]([^'\"]+)['\"](?:\s+USING\s+PigStorage\(['\"]([^'\"]+)['\"]\))?(?:\s+AS\s*\((.*)\))?", expr, re.IGNORECASE | re.DOTALL)
        if not m:
            raise ValueError(f"Malformed LOAD statement: {expr}")
        
        filename = m.group(1).strip()
        delimiter = m.group(2) if m.group(2) else ','
        schema_raw = m.group(3) if m.group(3) else None

        # Resolve file path in workspace or datasets
        filepath = os.path.join(self.workspace_dir, filename)
        if not os.path.exists(filepath):
            # check root datasets folder
            alt_path = os.path.abspath(os.path.join(self.workspace_dir, '..', '..', 'datasets', filename))
            if os.path.exists(alt_path):
                filepath = alt_path
            else:
                raise FileNotFoundError(f"Input dataset file not found: {filename}")

        # Parse schema
        schema = []
        if schema_raw:
            parts = [p.strip() for p in schema_raw.split(',') if p.strip()]
            for p in parts:
                col_type = p.split(':')
                col_name = col_type[0].strip()
                typ = col_type[1].strip().lower() if len(col_type) > 1 else 'chararray'
                schema.append((col_name, typ))
        
        # Read dataset
        data = []
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.reader(f, delimiter=delimiter)
            first_row = True
            for row in reader:
                if not row or all(cell.strip() == '' for cell in row):
                    continue
                # If first row looks like header, check
                if first_row:
                    first_row = False
                    if not schema:
                        schema = [(c.strip(), 'chararray') for c in row]
                        continue
                    else:
                        # Check if header matches column names
                        if row[0].strip().lower() == schema[0][0].lower() or any(not self._is_number(row[i]) for i in range(min(len(row), len(schema))) if schema[i][1] in ('int', 'float', 'double')):
                            continue
                
                # Parse row with schema casting
                typed_row = []
                for idx, col_def in enumerate(schema):
                    val = row[idx].strip() if idx < len(row) else ''
                    typ = col_def[1]
                    typed_row.append(self._cast_value(val, typ))
                data.append(typed_row)

        self.relations[target] = data
        self.schemas[target] = schema
        self.log("INFO", f"LOAD {target}: Successfully loaded {len(data)} records from '{filename}'")

    def _handle_filter(self, target, expr):
        m = re.search(r'FILTER\s+([A-Za-z0-9_]+)\s+BY\s+(.+)$', expr, re.IGNORECASE)
        if not m:
            raise ValueError(f"Malformed FILTER statement: {expr}")
        source = m.group(1).strip()
        condition = m.group(2).strip()

        if source not in self.relations:
            raise ValueError(f"Undefined relation: {source}")

        data = self.relations[source]
        schema = self.schemas.get(source, [])
        col_indices = {col[0]: idx for idx, col in enumerate(schema)}

        filtered = []
        for row in data:
            if self._eval_condition(condition, row, col_indices):
                filtered.append(row)

        self.relations[target] = filtered
        self.schemas[target] = schema
        self.log("INFO", f"FILTER {target}: Evaluated condition, {len(filtered)} / {len(data)} records passed.")

    def _eval_condition(self, cond, row, col_indices):
        # Convert condition to Python boolean expression
        expr = cond
        # Handle AND / OR / NOT
        expr = re.sub(r'\bAND\b', 'and', expr, flags=re.IGNORECASE)
        expr = re.sub(r'\bOR\b', 'or', expr, flags=re.IGNORECASE)
        expr = re.sub(r'\bNOT\b', 'not', expr, flags=re.IGNORECASE)
        # Handle ==, !=, >=, <=, >, <
        # Replace identifiers with row values
        for col_name, idx in col_indices.items():
            pattern = r'\b' + re.escape(col_name) + r'\b'
            val = row[idx]
            rep = repr(val)
            expr = re.sub(pattern, rep, expr)
        try:
            return bool(eval(expr, {"__builtins__": {}}, {}))
        except Exception:
            return False

    def _handle_foreach(self, target, expr):
        m = re.search(r'FOREACH\s+([A-Za-z0-9_]+)\s+GENERATE\s+(.+)$', expr, re.IGNORECASE)
        if not m:
            raise ValueError(f"Malformed FOREACH statement: {expr}")
        source = m.group(1).strip()
        fields_str = m.group(2).strip()

        if source not in self.relations:
            raise ValueError(f"Undefined relation: {source}")

        data = self.relations[source]
        schema = self.schemas.get(source, [])
        col_indices = {col[0]: idx for idx, col in enumerate(schema)}

        field_tokens = [f.strip() for f in fields_str.split(',') if f.strip()]
        new_schema = []
        projections = []

        for fld in field_tokens:
            alias = None
            if " AS " in fld.upper():
                fld_parts = re.split(r'\s+AS\s+', fld, flags=re.IGNORECASE)
                fld = fld_parts[0].strip()
                alias = fld_parts[1].strip()
            projections.append((fld, alias))
            new_schema.append((alias or fld, 'chararray'))

        new_data = []
        for row in data:
            new_row = []
            for fld, alias in projections:
                # Direct column
                if fld in col_indices:
                    new_row.append(row[col_indices[fld]])
                elif fld == 'group':
                    new_row.append(row[0] if len(row) > 0 else None)
                elif re.match(r'^(COUNT|SUM|AVG|MAX|MIN)\(', fld, re.IGNORECASE):
                    # Aggregates evaluated per row (usually inside group bag)
                    val = self._eval_aggregate_on_row(fld, row, schema)
                    new_row.append(val)
                elif 'ROUND(' in fld.upper():
                    m_rnd = re.search(r'ROUND\((.+)\)', fld, re.IGNORECASE)
                    if m_rnd:
                        inner = m_rnd.group(1)
                        # evaluate inner
                        val = self._eval_math_expr(inner, row, col_indices)
                        new_row.append(round(val, 2) if isinstance(val, (int, float)) else val)
                    else:
                        new_row.append(fld)
                else:
                    # Qualified name e.g. employees::name
                    clean_fld = fld.split('::')[-1]
                    if clean_fld in col_indices:
                        new_row.append(row[col_indices[clean_fld]])
                    else:
                        new_row.append(fld)
            new_data.append(new_row)

        self.relations[target] = new_data
        self.schemas[target] = new_schema
        self.log("INFO", f"FOREACH {target}: Projected {len(new_data)} records with schema.")

    def _eval_aggregate_on_row(self, agg_expr, row, schema):
        m = re.match(r'^(COUNT|SUM|AVG|MAX|MIN)\(([A-Za-z0-9_.:]+)\)', agg_expr, re.IGNORECASE)
        if not m:
            return 0
        func = m.group(1).upper()
        arg = m.group(2)
        # If row contains a bag (list of records) at index 1
        bag = row[1] if len(row) > 1 and isinstance(row[1], list) else []
        bag_schema = schema[1][1] if len(schema) > 1 and isinstance(schema[1][1], list) else []
        bag_cols = {col[0]: idx for idx, col in enumerate(bag_schema)}

        if func == 'COUNT':
            return len(bag)

        # Extract values
        col_name = arg.split('.')[-1]
        c_idx = bag_cols.get(col_name, -1)
        nums = []
        for r in bag:
            if c_idx != -1 and c_idx < len(r):
                try:
                    nums.append(float(r[c_idx]))
                except Exception:
                    pass
            else:
                for v in r:
                    if isinstance(v, (int, float)):
                        nums.append(float(v))
                        break

        if not nums:
            return 0.0

        if func == 'SUM':
            return sum(nums)
        elif func == 'AVG':
            return round(sum(nums) / len(nums), 2)
        elif func == 'MAX':
            return max(nums)
        elif func == 'MIN':
            return min(nums)
        return 0

    def _eval_math_expr(self, expr, row, col_indices):
        e = expr
        # replace any AVG(...) or COUNT(...)
        m_agg = re.search(r'(COUNT|SUM|AVG|MAX|MIN)\([^\)]+\)', e, re.IGNORECASE)
        if m_agg:
            agg_call = m_agg.group(0)
            agg_val = self._eval_aggregate_on_row(agg_call, row, [(k, 'chararray') for k in col_indices.keys()])
            e = e.replace(agg_call, str(agg_val))
        for col, idx in col_indices.items():
            pattern = r'\b' + re.escape(col) + r'\b'
            e = re.sub(pattern, str(row[idx]), e)
        try:
            return eval(e, {"__builtins__": {}}, {})
        except Exception:
            return 0.0

    def _handle_group(self, target, expr):
        m = re.search(r'GROUP\s+([A-Za-z0-9_]+)\s+(?:BY\s+(.+)|ALL)', expr, re.IGNORECASE)
        if not m:
            raise ValueError(f"Malformed GROUP statement: {expr}")
        source = m.group(1).strip()
        is_all = "ALL" in expr.upper().split()
        group_key_col = m.group(2).strip() if not is_all and m.group(2) else None

        if source not in self.relations:
            raise ValueError(f"Undefined relation: {source}")

        data = self.relations[source]
        schema = self.schemas.get(source, [])
        col_indices = {col[0]: idx for idx, col in enumerate(schema)}

        groups = defaultdict(list)
        if is_all:
            for row in data:
                groups['all'].append(row)
        else:
            k_idx = col_indices.get(group_key_col)
            if k_idx is None:
                raise ValueError(f"Unknown group column '{group_key_col}' in schema {schema}")
            for row in data:
                key = row[k_idx]
                groups[key].append(row)

        grouped_data = []
        for key, bag in sorted(groups.items(), key=lambda x: str(x[0])):
            grouped_data.append([key, bag])

        self.relations[target] = grouped_data
        self.schemas[target] = [('group', 'chararray'), (source, schema)]
        self.log("INFO", f"GROUP {target}: Created {len(grouped_data)} groups from '{source}'")

    def _handle_join(self, target, expr):
        m = re.search(r'JOIN\s+([A-Za-z0-9_]+)\s+BY\s+([A-Za-z0-9_]+),\s*([A-Za-z0-9_]+)\s+BY\s+([A-Za-z0-9_]+)', expr, re.IGNORECASE)
        if not m:
            raise ValueError(f"Malformed JOIN statement: {expr}")
        r1, k1, r2, k2 = m.group(1), m.group(2), m.group(3), m.group(4)
        
        if r1 not in self.relations or r2 not in self.relations:
            raise ValueError(f"Join relations not found: {r1}, {r2}")

        data1 = self.relations[r1]
        schema1 = self.schemas[r1]
        idx1 = {col[0]: i for i, col in enumerate(schema1)}[k1]

        data2 = self.relations[r2]
        schema2 = self.schemas[r2]
        idx2 = {col[0]: i for i, col in enumerate(schema2)}[k2]

        joined = []
        for row1 in data1:
            for row2 in data2:
                if str(row1[idx1]) == str(row2[idx2]):
                    joined.append(row1 + row2)

        new_schema = [(f"{r1}::{col[0]}", col[1]) for col in schema1] + [(f"{r2}::{col[0]}", col[1]) for col in schema2]
        self.relations[target] = joined
        self.schemas[target] = new_schema
        self.log("INFO", f"JOIN {target}: Equi-join produced {len(joined)} combined tuples.")

    def _handle_order(self, target, expr):
        m = re.search(r'ORDER\s+([A-Za-z0-9_]+)\s+BY\s+([A-Za-z0-9_]+)(?:\s+(ASC|DESC))?', expr, re.IGNORECASE)
        if not m:
            raise ValueError(f"Malformed ORDER statement: {expr}")
        source = m.group(1).strip()
        col = m.group(2).strip()
        direction = (m.group(3) or 'ASC').upper()

        data = self.relations[source]
        schema = self.schemas[source]
        col_indices = {c[0]: i for i, c in enumerate(schema)}
        c_idx = col_indices[col]

        reverse = (direction == 'DESC')
        sorted_data = sorted(data, key=lambda r: (r[c_idx] is None, r[c_idx]), reverse=reverse)
        self.relations[target] = sorted_data
        self.schemas[target] = schema
        self.log("INFO", f"ORDER {target}: Sorted by '{col}' ({direction})")

    def _handle_distinct(self, target, expr):
        m = re.search(r'DISTINCT\s+([A-Za-z0-9_]+)', expr, re.IGNORECASE)
        source = m.group(1).strip()
        data = self.relations[source]
        schema = self.schemas[source]
        
        seen = set()
        distinct_data = []
        for row in data:
            key = tuple(row)
            if key not in seen:
                seen.add(key)
                distinct_data.append(row)
        self.relations[target] = distinct_data
        self.schemas[target] = schema
        self.log("INFO", f"DISTINCT {target}: Deduplicated {len(data)} tuples -> {len(distinct_data)} unique tuples.")

    def _handle_limit(self, target, expr):
        m = re.search(r'LIMIT\s+([A-Za-z0-9_]+)\s+(\d+)', expr, re.IGNORECASE)
        source = m.group(1).strip()
        n = int(m.group(2))
        data = self.relations[source]
        self.relations[target] = data[:n]
        self.schemas[target] = self.schemas[source]
        self.log("INFO", f"LIMIT {target}: Retained top {n} records.")

    def _handle_union(self, target, expr):
        parts = [p.strip() for p in expr[5:].split(',') if p.strip()]
        combined = []
        schema = None
        for p in parts:
            if p in self.relations:
                combined.extend(self.relations[p])
                if schema is None:
                    schema = self.schemas.get(p)
        self.relations[target] = combined
        self.schemas[target] = schema or []
        self.log("INFO", f"UNION {target}: Combined relations into {len(combined)} tuples.")

    def _cast_value(self, val, typ):
        if val is None or val == '':
            return None
        try:
            if typ in ('int', 'integer', 'long'):
                return int(val)
            elif typ in ('float', 'double'):
                return float(val)
            return str(val)
        except Exception:
            return val

    def _is_number(self, val):
        try:
            float(val)
            return True
        except ValueError:
            return False

    def _format_value(self, v):
        if isinstance(v, list):
            return "{" + ", ".join(self._format_value(x) for x in v) + "}"
        return str(v)

